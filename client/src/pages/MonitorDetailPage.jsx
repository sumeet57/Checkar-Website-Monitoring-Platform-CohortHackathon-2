import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchJobById, updateJob } from "../features/jobs/jobsSlice";
import { fetchLogs } from "../features/logs/logsSlice";

const getBarColor = (pct) => {
	if (pct === null) return "bg-zinc-800";
	if (pct >= 99) return "bg-orange-400";
	if (pct >= 95) return "bg-orange-500";
	if (pct >= 80) return "bg-amber-500";
	return "bg-red-500";
};

const buildUptimeBar = (logs) => {
	const byDate = new Map();

	logs.forEach((log) => {
		const date = log.timestamp.split("T")[0];
		const entry = byDate.get(date) ?? { up: 0, total: 0 };
		entry.total += 1;
		if (log.isValid) entry.up += 1;
		byDate.set(date, entry);
	});

	return Array.from({ length: 45 }, (_, index) => {
		const date = new Date();
		date.setDate(date.getDate() - (44 - index));
		const key = date.toISOString().split("T")[0];
		const entry = byDate.get(key);
		return { date: key, pct: entry ? Math.round((entry.up / entry.total) * 100) : null };
	});
};

const LineChartSvg = ({ data, threshold = 1000 }) => {
	if (!data.length) {
		return <div className="h-65 rounded-lg bg-zinc-950" />;
	}

	const width = 900;
	const height = 260;
	const padding = 24;
	const values = data.map((point) => point.latency ?? 0);
	const max = Math.max(threshold, ...values, 1);
	const min = 0;
	const innerWidth = width - padding * 2;
	const innerHeight = height - padding * 2;
	const stepX = innerWidth / Math.max(data.length - 1, 1);
	const points = data
		.map((point, index) => {
			const x = padding + index * stepX;
			const value = point.latency ?? 0;
			const y = padding + innerHeight - ((value - min) / (max - min || 1)) * innerHeight;
			return `${x},${y}`;
		})
		.join(" ");
	const thresholdY = padding + innerHeight - ((threshold - min) / (max - min || 1)) * innerHeight;

	return (
		<svg viewBox={`0 0 ${width} ${height}`} className="h-65 w-full">
			{[0, 1, 2, 3, 4].map((row) => (
				<line
					key={row}
					x1={padding}
					x2={width - padding}
					y1={padding + (innerHeight / 4) * row}
					y2={padding + (innerHeight / 4) * row}
					stroke="#334155"
					strokeDasharray="3 3"
				/>
			))}
			<line x1={padding} x2={width - padding} y1={thresholdY} y2={thresholdY} stroke="#fb923c" strokeDasharray="4 4" />
			<polyline fill="none" stroke="#fb923c" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />
			{data.map((point, index) => {
				const x = padding + index * stepX;
				const value = point.latency ?? 0;
				const y = padding + innerHeight - ((value - min) / (max - min || 1)) * innerHeight;
				return point.isAnomaly ? <circle key={index} cx={x} cy={y} r="5" fill="#ef4444" /> : null;
			})}
		</svg>
	);
};

const StatusPill = ({ status }) => {
	const styles = {
		up: "bg-green-900/30 text-green-400",
		down: "bg-red-900/30 text-red-400",
		pending: "bg-gray-800 text-gray-400",
	};

	return <span className={`rounded px-2 py-1 text-xs font-mono uppercase tracking-widest ${styles[status] ?? styles.pending}`}>{status}</span>;
};

const MonitorDetailPage = () => {
	const { id } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const activeJob = useSelector((state) => state.jobs.activeJob);
	const jobsLoading = useSelector((state) => state.jobs.loading);
	const logs = useSelector((state) => state.logs.logs);
	const logsLoading = useSelector((state) => state.logs.loading);

	useEffect(() => {
		if (id) {
			dispatch(fetchJobById(id));
			dispatch(fetchLogs(id));
		}
	}, [dispatch, id]);

	const chartData = useMemo(
		() =>
			logs.slice(-60).map((log) => ({
				time: new Date(log.timestamp).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
				latency: log.isValid ? log.latency : null,
				isAnomaly: log.isAnomaly,
				zScore: log.zScore,
			})),
		[logs],
	);

	const validLogs = chartData.filter((item) => item.latency !== null);
	const averageLatency = validLogs.length ? Math.round(validLogs.reduce((sum, item) => sum + item.latency, 0) / validLogs.length) : 0;
	const p99Latency = validLogs.length ? Math.max(...validLogs.map((item) => item.latency)) : 0;
	const uptimePct = logs.length ? Math.round((logs.filter((log) => log.isValid).length / logs.length) * 100) : 0;
	const anomalies = logs.filter((log) => log.isAnomaly);
	const uptimeBar = useMemo(() => buildUptimeBar(logs), [logs]);

	if (jobsLoading || logsLoading) {
		return (
			<div className="min-h-screen bg-[#09090b] p-6 text-white">
				<div className="mx-auto max-w-7xl space-y-6">
					<div className="h-16 animate-pulse rounded border border-zinc-700 bg-zinc-900" />
					<div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_360px]">
						<div className="h-80 animate-pulse rounded border border-zinc-700 bg-zinc-900" />
						<div className="h-80 animate-pulse rounded border border-zinc-700 bg-zinc-900" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-zinc-950 p-6 text-zinc-50">
			<div className="mx-auto max-w-7xl space-y-6">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div>
						<div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Monitor detail</div>
						<div className="mt-2 flex items-center gap-3">
							<h1 className="text-3xl font-semibold text-zinc-50">{activeJob?.title ?? "Monitor"}</h1>
							<StatusPill status={activeJob?.lastStatus ?? "pending"} />
						</div>
						<div className="mt-3 font-mono text-sm text-zinc-300">{activeJob?.type ?? "unknown"} · {activeJob?.url ?? `${activeJob?.host ?? ""}${activeJob?.port ? `:${activeJob.port}` : ""}`}</div>
					</div>
					<div className="flex gap-3">
						<button
							type="button"
							onClick={() => {
								dispatch(updateJob({ id, data: { isActive: !activeJob?.isActive } }));
								toast.success(activeJob?.isActive ? "Monitor paused" : "Monitor resumed");
							}}
							className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-50 hover:bg-zinc-800"
						>
							{activeJob?.isActive ? "Pause" : "Resume"}
						</button>
						<button
							type="button"
							onClick={() => navigate(`/dashboard/monitors/${id}/edit`)}
							className="rounded-full bg-orange-400 px-4 py-2 text-sm font-mono text-zinc-950 hover:bg-orange-500"
						>
							Edit monitor
						</button>
					</div>
				</div>

				<div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_360px]">
					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-xs uppercase tracking-[0.35em] text-zinc-500">Latency (last 24 hours)</div>
								<div className="mt-2 text-xs text-zinc-300">Average {averageLatency}ms · P99 {p99Latency}ms</div>
							</div>
							<div className="text-xs text-zinc-300">1000ms limit</div>
						</div>
						<div className="mt-4">
							<LineChartSvg data={chartData} threshold={1000} />
						</div>
					</div>

					<div className="space-y-4">
						<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
							<div className="text-xs uppercase tracking-[0.35em] text-zinc-500">Total uptime</div>
							<div className="mt-3 font-mono text-4xl font-semibold text-orange-400">{uptimePct}%</div>
							<div className="mt-4 flex gap-1">
								{uptimeBar.slice(-16).map((bar) => (
									<div key={bar.date} className={`h-3 flex-1 rounded-sm ${getBarColor(bar.pct)}`} title={`${bar.date}: ${bar.pct === null ? "no data" : `${bar.pct}%`}`} />
								))}
							</div>
						</div>

						<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
							<div className="text-xs uppercase tracking-[0.35em] text-zinc-500">Last check</div>
							<div className="mt-3 font-mono text-4xl font-semibold text-zinc-50">{activeJob?.lastLatency ?? 0}ms</div>
							<div className="mt-2 text-xs uppercase tracking-[0.25em] text-zinc-300">Status: {activeJob?.lastStatus ?? "unknown"}</div>
						</div>

						<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
							<div className="text-xs uppercase tracking-[0.35em] text-zinc-500">Node health</div>
							<div className="mt-4 space-y-3 text-sm">
								{[
									["us-east-1", "102ms"],
									["eu-central-1", "245ms"],
									["ap-southeast-1", "412ms"],
								].map(([region, latency]) => (
									<div key={region} className="flex items-center justify-between text-zinc-200">
										<span>{region}</span>
										<span className={`font-mono ${latency.includes("4") ? "text-amber-400" : "text-orange-400"}`}>{latency}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				<div className="grid gap-4 lg:grid-cols-2">
					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
						<div className="mb-4 text-xs uppercase tracking-widest text-zinc-500">45-day service history</div>
						<div className="flex flex-wrap gap-1">
							{uptimeBar.map((bar) => (
									<div key={bar.date} title={`${bar.date}: ${bar.pct === null ? "no data" : `${bar.pct}%`}`} className={`h-8 w-2.5 rounded-sm cursor-pointer ${getBarColor(bar.pct)}`} />
							))}
						</div>
						<div className="mt-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-500">
							<span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-400" /> 100%</span>
							<span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> &gt;95%</span>
							<span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400" /> &lt;95%</span>
						</div>
					</div>

					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
						<div className="mb-4 text-xs uppercase tracking-widest text-zinc-500">Recent checks</div>
						<div className="overflow-x-auto">
							<table className="w-full border-collapse">
								<thead>
									<tr>
										{["Timestamp", "Status", "Response Time", "Node", "Action"].map((column) => (
											<th key={column} className="bg-zinc-950 px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-zinc-500">{column}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{logs.slice(-20).map((log) => (
										<tr key={log.timestamp} className="border-b border-zinc-700">
											<td className="px-4 py-3 font-mono text-sm text-zinc-300">{new Date(log.timestamp).toLocaleString()}</td>
											<td className="px-4 py-3 font-mono text-sm">{log.isValid ? "200 OK" : "503 ERROR"}</td>
											<td className="px-4 py-3 font-mono text-sm">{log.latency ?? "-"}ms</td>
											<td className="px-4 py-3 font-mono text-sm">{activeJob?.type === "port" ? `${activeJob.host}:${activeJob.port}` : activeJob?.type ?? "node"}</td>
											<td className="px-4 py-3 font-mono text-sm">
												{log.isAnomaly ? <span className="rounded-full bg-red-900/30 px-2 py-1 text-red-400">z={log.zScore}</span> : <span className="rounded-full bg-zinc-800 px-2 py-1 text-zinc-400">Details</span>}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				<div className="grid gap-4 md:grid-cols-3">
					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
						<div className="text-xs uppercase tracking-widest text-zinc-500">Uptime</div>
						<div className="mt-3 font-mono text-2xl font-medium">{uptimePct}%</div>
					</div>
					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
						<div className="text-xs uppercase tracking-widest text-zinc-500">Logs</div>
						<div className="mt-3 font-mono text-2xl font-medium">{logs.length}</div>
					</div>
					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
						<div className="text-xs uppercase tracking-widest text-zinc-500">Anomalies</div>
						<div className="mt-3 font-mono text-2xl font-medium">{anomalies.length}</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MonitorDetailPage;