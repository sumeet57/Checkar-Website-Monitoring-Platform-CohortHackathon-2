import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchJobs } from "../features/jobs/jobsSlice";

const typeStyles = {
	api: "bg-orange-400/15 text-orange-300",
	server: "bg-zinc-800 text-zinc-300",
	ssl: "bg-green-900/30 text-green-400",
	port: "bg-amber-900/30 text-amber-400",
	frontend: "bg-orange-950 text-orange-200",
};

const buildSparklineData = (job) => {
	const base = job?.stats?.meanLatency ?? job?.lastLatency ?? 100;
	return [-12, -8, -4, 0, 6, 3, 9].map((offset) => ({ value: Math.max(0, base + offset) }));
};

const Sparkline = ({ data }) => {
	if (!data.length) return null;

	const width = 180;
	const height = 42;
	const values = data.map((point) => point.value);
	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min || 1;
	const stepX = width / Math.max(data.length - 1, 1);
	const points = data
		.map((point, index) => {
			const x = index * stepX;
			const y = height - ((point.value - min) / range) * height;
			return `${x},${y}`;
		})
		.join(" ");

	return (
		<svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full overflow-visible">
			<polyline fill="none" stroke="#fb923c" strokeWidth="2.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
};

const SkeletonCard = () => (
	<div className="h-55 animate-pulse rounded-xl border border-zinc-700 bg-zinc-900 p-4">
		<div className="mb-4 h-4 w-24 rounded bg-zinc-800" />
		<div className="mb-3 h-8 w-20 rounded bg-zinc-800" />
		<div className="h-24 rounded-lg bg-zinc-950" />
	</div>
);

const AlertBanner = ({ jobs }) => {
	const downJobs = jobs.filter((job) => job.lastStatus === "down");

	if (!downJobs.length) {
		return (
			<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-zinc-50">
				<div className="font-mono text-xs uppercase tracking-widest text-orange-300">System status</div>
				<div className="mt-1 text-sm text-zinc-300">All monitors are currently healthy.</div>
			</div>
		);
	}

	const critical = downJobs[0];

	return (
		<div className="rounded-xl border border-orange-900/40 bg-orange-950 px-5 py-4 shadow-lg shadow-black/20">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<div className="text-sm font-semibold text-zinc-50">Critical incident detected</div>
					<div className="mt-1 text-xs text-orange-200">
						{critical.title} is currently unreachable. Latency spiked before timeout.
					</div>
				</div>
				<div className="rounded-full border border-orange-700 bg-orange-900/40 px-4 py-2 text-xs font-mono uppercase tracking-widest text-orange-200">
					View logs
				</div>
			</div>
		</div>
	);
};

const MonitorCard = ({ job, onClick }) => {
	const uptime = job.lastStatus === "down" ? 0 : job.lastStatus === "pending" ? 50 : 100;
	const sparklineData = useMemo(() => buildSparklineData(job), [job]);

	return (
		<button
			type="button"
			onClick={onClick}
			className="rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-left transition hover:-translate-y-0.5 hover:border-orange-400/60"
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<div className="flex items-center gap-2">
						<span className={`relative flex h-3 w-3 rounded-full ${job.lastStatus === "up" ? "bg-green-400" : job.lastStatus === "down" ? "bg-red-400" : "bg-gray-500"}`}>
							<span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${job.lastStatus === "up" ? "bg-green-400/70" : job.lastStatus === "down" ? "bg-red-400/70" : "bg-gray-500/70"}`} />
						</span>
						<div className="text-sm font-medium text-zinc-50">{job.title}</div>
					</div>
					<div className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-mono ${typeStyles[job.type] ?? "bg-zinc-800 text-zinc-300"}`}>
						{job.type}
					</div>
				</div>
				<div className="text-right font-mono text-xs text-zinc-500">
					<div>{uptime}% uptime</div>
					<div className="mt-1">{job.lastLatency ?? 0} ms</div>
				</div>
			</div>

			<div className="mt-4 h-10">
				<Sparkline data={sparklineData} />
			</div>
		</button>
	);
};

const DashboardPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const jobs = useSelector((state) => state.jobs.jobs);
	const user = useSelector((state) => state.auth.user);
	const alerts = useSelector((state) => state.alerts.alerts ?? []);
	const loading = useSelector((state) => state.jobs.loading);
	const [activeFilter, setActiveFilter] = useState("all");
	const displayName =
		typeof user?.name === "string"
			? user.name
			: [user?.name?.firstName, user?.name?.lastName].filter(Boolean).join(" ");

	useEffect(() => {
		dispatch(fetchJobs({ page: 1, limit: 20 }));
	}, [dispatch]);

	const filteredJobs = useMemo(
		() => jobs.filter((job) => activeFilter === "all" || job.type === activeFilter),
		[jobs, activeFilter],
	);
	const total = jobs.length;
	const up = jobs.filter((job) => job.lastStatus === "up").length;
	const down = jobs.filter((job) => job.lastStatus === "down").length;
	const avgUptime = total ? Math.round((up / total) * 100) : 0;
	const avgLatency = total ? Math.round(jobs.reduce((sum, job) => sum + (job.lastLatency || 0), 0) / total) : 0;

	return (
		<div className="min-h-screen bg-bg-base p-6 text-zinc-50">
			<div className="mx-auto max-w-7xl space-y-6">
				<AlertBanner jobs={jobs} />

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
					{[
						["Total monitors", total, `${jobs.filter((job) => job.isActive).length} active`],
						["Uptime (24h)", `${avgUptime}%`, `${up} healthy`],
						["Active incidents", down, down ? `${down} require attention` : "No incidents"],
						["Avg latency", `${avgLatency}ms`, "Across all checks"],
					].map(([label, value, sub]) => (
						<div key={label} className="rounded-xl border border-zinc-700 bg-bg-base/95 p-5">
							<div className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">{label}</div>
							<div className="mt-4 font-mono text-4xl font-semibold text-zinc-50">{value}</div>
							<div className="mt-2 text-xs text-zinc-400">{sub}</div>
						</div>
					))}
				</div>

				<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div>
						<div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Overview</div>
						<h1 className="mt-2 text-3xl font-semibold text-zinc-50">
							Welcome back{displayName ? `, ${displayName}` : ""}
						</h1>
						<p className="mt-2 text-sm text-zinc-300">Monitor infrastructure health, response times, and active incidents in real time.</p>
					</div>
					<button
						type="button"
						onClick={() => navigate("/dashboard/monitors/new")}
						className="rounded-full bg-orange-400 px-4 py-2 text-sm font-mono text-zinc-950 shadow-glow-orange transition hover:bg-orange-500"
					>
						Add monitor
					</button>
				</div>

					<div className="flex flex-wrap gap-2 border-b border-zinc-700 pb-4">
					{["all", "api", "server", "ssl", "port", "frontend"].map((filter) => (
						<button
							key={filter}
							type="button"
							onClick={() => setActiveFilter(filter)}
								className={`rounded-full px-3 py-2 text-xs font-mono uppercase tracking-widest transition ${activeFilter === filter ? "bg-orange-400 text-zinc-950" : "border border-zinc-700 bg-zinc-900 text-zinc-300"}`}
						>
							{filter}
						</button>
					))}
				</div>

				{loading ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, index) => (
							<SkeletonCard key={index} />
						))}
					</div>
				) : (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{filteredJobs.map((job) => (
							<MonitorCard key={job._id} job={job} onClick={() => navigate(`/dashboard/monitors/${job._id}`)} />
						))}

						<div className="flex min-h-55  items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900 p-4 text-center text-zinc-500 hover:border-orange-400">
							<button type="button" className="cursor-pointer" onClick={() => navigate("/dashboard/monitors/new")}>
								<div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-xl text-orange-400">+</div>
								<div className="text-xs uppercase tracking-widest">Add monitor</div>
							</button>
						</div>
					</div>
				)}

				<div className="grid gap-4 lg:grid-cols-3">
					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 lg:col-span-2">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-xs uppercase tracking-[0.35em] text-zinc-500">System uptime</div>
								<div className="mt-3 font-mono text-3xl font-semibold text-orange-400">99.998%</div>
							</div>
							<div className="text-right text-xs text-zinc-500">last 30d</div>
						</div>
						<div className="mt-5 grid gap-1" style={{ gridTemplateColumns: "repeat(20, minmax(0, 1fr))" }}>
							{Array.from({ length: 20 }).map((_, index) => (
								<div key={index} className={`h-10 rounded-sm ${index === 5 ? "bg-red-500" : "bg-orange-400/80"}`} />
							))}
						</div>
					</div>

					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
						<div className="text-xs uppercase tracking-[0.35em] text-zinc-500">Avg latency</div>
						<div className="mt-3 font-mono text-4xl font-semibold text-zinc-50">{avgLatency}ms</div>
						<div className="mt-5">
							<Sparkline data={buildSparklineData({ stats: { meanLatency: avgLatency } })} />
						</div>
					</div>
				</div>

			</div>
		</div>
	);
};

export default DashboardPage;