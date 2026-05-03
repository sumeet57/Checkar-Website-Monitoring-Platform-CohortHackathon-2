import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchIncidents } from "../features/incidents/incidentsSlice";

const typeStyles = {
	CRITICAL_FAILURE: "text-red-400 bg-red-900/30 border-red-900/40",
	PERFORMANCE_ANOMALY: "text-amber-400 bg-amber-900/30 border-amber-900/40",
};

const statusStyles = {
	active: "bg-red-900/30 text-red-400 border-red-900/40",
	resolved: "bg-green-900/30 text-green-400 border-green-900/40",
};

const timeAgo = (iso) => {
	const diff = Date.now() - new Date(iso).getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 1) return "just now";
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
};

const IncidentsPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const incidents = useSelector((state) => state.incidents.incidents);
	const loading = useSelector((state) => state.incidents.loading);
	const [activeTab, setActiveTab] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		dispatch(fetchIncidents());
	}, [dispatch]);

	const filtered = useMemo(() => {
		let list = incidents;
		if (activeTab !== "all") {
			list = list.filter((i) => i.status === activeTab);
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			list = list.filter(
				(i) =>
					(i.type || "").toLowerCase().includes(q) ||
					(i.rawLogs?.message || "").toLowerCase().includes(q) ||
					(i.aiReport?.summary || "").toLowerCase().includes(q),
			);
		}
		return list;
	}, [incidents, activeTab, searchQuery]);

	const activeCount = incidents.filter((i) => i.status === "active").length;
	const resolvedCount = incidents.filter((i) => i.status === "resolved").length;

	return (
		<div className="min-h-screen bg-zinc-950 p-6 text-zinc-50">
			<div className="mx-auto max-w-7xl space-y-6">
				{/* Header */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Incidents</div>
						<h1 className="mt-2 text-3xl font-semibold">Incident response</h1>
						<p className="mt-2 text-sm text-zinc-300">Track outages, anomalies, and AI-generated postmortems.</p>
					</div>
					<div className="flex flex-col gap-3 md:flex-row md:items-center">
						<div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2">
							<input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search incidents..."
								className="w-64 bg-transparent text-sm text-zinc-50 outline-none placeholder:text-zinc-500"
							/>
						</div>
						<div className="flex rounded-full border border-zinc-700 bg-zinc-900 p-1">
							{[
								{ key: "all", label: `All (${incidents.length})` },
								{ key: "active", label: `Active (${activeCount})` },
								{ key: "resolved", label: `Resolved (${resolvedCount})` },
							].map((tab) => (
								<button
									key={tab.key}
									type="button"
									onClick={() => setActiveTab(tab.key)}
									className={`rounded-full px-4 py-2 text-sm font-mono ${activeTab === tab.key ? "bg-orange-400 text-zinc-950" : "text-zinc-400"}`}
								>
									{tab.label}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Summary cards */}
				<div className="grid gap-4 md:grid-cols-3">
					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
						<div className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">Total incidents</div>
						<div className="mt-3 font-mono text-4xl font-semibold text-zinc-50">{incidents.length}</div>
					</div>
					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
						<div className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">Active</div>
						<div className="mt-3 font-mono text-4xl font-semibold text-red-400">{activeCount}</div>
					</div>
					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
						<div className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">Resolved</div>
						<div className="mt-3 font-mono text-4xl font-semibold text-green-400">{resolvedCount}</div>
					</div>
				</div>

				{/* Incidents list */}
				{loading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-40 animate-pulse rounded-xl border border-zinc-700 bg-zinc-900" />
						))}
					</div>
				) : filtered.length ? (
					<div className="space-y-4">
						{filtered.map((incident) => (
							<button
								key={incident._id}
								type="button"
								onClick={() => navigate(`/dashboard/incidents/${incident._id}`)}
								className="w-full rounded-xl border border-zinc-700 bg-zinc-900 p-5 text-left transition hover:border-orange-400/60 hover:-translate-y-0.5"
							>
								<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
									<div className="flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<span className={`rounded border px-2 py-1 text-xs font-mono uppercase tracking-widest ${typeStyles[incident.type] ?? typeStyles.PERFORMANCE_ANOMALY}`}>
												{incident.type?.replace(/_/g, " ") || "incident"}
											</span>
											<span className={`rounded border px-2 py-1 text-xs font-mono uppercase tracking-widest ${statusStyles[incident.status] ?? statusStyles.active}`}>
												{incident.status}
											</span>
										</div>

										{incident.aiReport?.summary && (
											<p className="mt-3 text-sm text-zinc-300 line-clamp-2">{incident.aiReport.summary}</p>
										)}

										<div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
											{incident.rawLogs?.status && (
												<span className="font-mono">HTTP {incident.rawLogs.status}</span>
											)}
											{incident.rawLogs?.latency && (
												<span className="font-mono">{incident.rawLogs.latency}ms</span>
											)}
											{incident.rawLogs?.zScore && (
												<span className="font-mono">z-score: {incident.rawLogs.zScore}</span>
											)}
											<span>•</span>
											<span>{timeAgo(incident.createdAt)}</span>
										</div>
									</div>

									<div className="shrink-0 text-right text-xs text-zinc-500">
										<div>{new Date(incident.createdAt).toLocaleDateString()}</div>
										<div className="mt-1">{new Date(incident.createdAt).toLocaleTimeString()}</div>
									</div>
								</div>
							</button>
						))}
					</div>
				) : activeTab === "active" ? (
					<div className="flex min-h-60 flex-col items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-center">
						<div className="text-4xl text-green-400">✓</div>
						<div className="mt-4 text-lg font-medium text-zinc-50">No active incidents. All systems operational.</div>
					</div>
				) : (
					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-sm text-zinc-500">No incidents match your filters.</div>
				)}
			</div>
		</div>
	);
};

export default IncidentsPage;