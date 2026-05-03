import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchIncidentById } from "../features/incidents/incidentsSlice";

const typeLabels = {
	CRITICAL_FAILURE: { label: "Critical Failure", color: "text-red-400 bg-red-900/30 border-red-900/40" },
	PERFORMANCE_ANOMALY: { label: "Performance Anomaly", color: "text-amber-400 bg-amber-900/30 border-amber-900/40" },
};

const statusLabels = {
	active: { label: "Active", color: "text-red-400 bg-red-900/30" },
	resolved: { label: "Resolved", color: "text-green-400 bg-green-900/30" },
};

const IncidentDetailPage = () => {
	const { id } = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const incident = useSelector((state) => state.incidents.activeIncident);
	const loading = useSelector((state) => state.incidents.loading);

	useEffect(() => {
		if (id) dispatch(fetchIncidentById(id));
	}, [dispatch, id]);

	if (loading || !incident) {
		return (
			<div className="min-h-screen bg-zinc-950 p-6 text-zinc-50">
				<div className="mx-auto max-w-5xl space-y-6">
					<div className="h-12 w-60 animate-pulse rounded bg-zinc-800" />
					<div className="h-80 animate-pulse rounded-xl border border-zinc-700 bg-zinc-900" />
					<div className="grid gap-4 md:grid-cols-2">
						<div className="h-60 animate-pulse rounded-xl border border-zinc-700 bg-zinc-900" />
						<div className="h-60 animate-pulse rounded-xl border border-zinc-700 bg-zinc-900" />
					</div>
				</div>
			</div>
		);
	}

	const typeInfo = typeLabels[incident.type] ?? { label: incident.type, color: "text-zinc-400 bg-zinc-800" };
	const statusInfo = statusLabels[incident.status] ?? statusLabels.active;

	return (
		<div className="min-h-screen bg-zinc-950 p-6 text-zinc-50">
			<div className="mx-auto max-w-5xl space-y-6">
				{/* Header */}
				<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div>
						<button
							type="button"
							onClick={() => navigate(-1)}
							className="mb-4 rounded-full border border-zinc-700 px-3 py-2 font-mono text-xs uppercase tracking-widest text-zinc-300 hover:bg-zinc-800"
						>
							← Back
						</button>
						<div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Incident detail</div>
						<div className="mt-2 flex flex-wrap items-center gap-3">
							<span className={`rounded border px-3 py-1 text-sm font-mono uppercase tracking-widest ${typeInfo.color}`}>
								{typeInfo.label}
							</span>
							<span className={`rounded px-3 py-1 text-sm font-mono uppercase tracking-widest ${statusInfo.color}`}>
								{statusInfo.label}
							</span>
						</div>
						<div className="mt-3 text-sm text-zinc-400">
							Created {new Date(incident.createdAt).toLocaleString()}
						</div>
					</div>
				</div>

				{/* Raw Logs Metrics */}
				{incident.rawLogs && (
					<div className="grid gap-4 md:grid-cols-4">
						<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
							<div className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">Latency</div>
							<div className="mt-3 font-mono text-3xl font-semibold text-orange-400">{incident.rawLogs.latency ?? "—"}ms</div>
						</div>
						<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
							<div className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">HTTP Status</div>
							<div className={`mt-3 font-mono text-3xl font-semibold ${incident.rawLogs.status >= 500 ? "text-red-400" : incident.rawLogs.status >= 400 ? "text-amber-400" : "text-green-400"}`}>
								{incident.rawLogs.status ?? "—"}
							</div>
						</div>
						<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
							<div className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">Z-Score</div>
							<div className={`mt-3 font-mono text-3xl font-semibold ${Number(incident.rawLogs.zScore) > 3 ? "text-red-400" : "text-zinc-50"}`}>
								{incident.rawLogs.zScore ?? "—"}
							</div>
						</div>
						<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
							<div className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">Message</div>
							<div className="mt-3 text-sm text-zinc-300">{incident.rawLogs.message ?? "—"}</div>
						</div>
					</div>
				)}

				{/* AI Report */}
				{incident.aiReport && (
					<div className="space-y-4">
						<div className="text-xs uppercase tracking-[0.3em] text-cyan-300">AI Postmortem Report</div>

						{/* Summary */}
						<div className="rounded-xl border border-cyan-500/40 bg-sky-950/60 p-6 shadow-[0_0_30px_rgba(6,182,212,0.08)]">
							<div className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-400">Summary</div>
							<p className="text-sm leading-7 text-zinc-200">{incident.aiReport.summary}</p>
						</div>

						{/* Root Cause */}
						<div className="rounded-xl border border-orange-500/30 bg-orange-950/30 p-6">
							<div className="mb-3 text-xs font-semibold uppercase tracking-widest text-orange-400">Root Cause</div>
							<p className="text-sm leading-7 text-zinc-200">{incident.aiReport.rootCause}</p>
						</div>

						{/* Suggested Fix */}
						<div className="rounded-xl border border-green-500/30 bg-green-950/30 p-6">
							<div className="mb-3 text-xs font-semibold uppercase tracking-widest text-green-400">Suggested Fix</div>
							<p className="text-sm leading-7 text-zinc-200">{incident.aiReport.suggestedFix}</p>
						</div>
					</div>
				)}

				{/* Metadata */}
				<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
					<div className="mb-4 text-xs uppercase tracking-widest text-zinc-500">Metadata</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<div className="text-xs text-zinc-500">Incident ID</div>
							<div className="mt-1 font-mono text-sm text-zinc-300 break-all">{incident._id}</div>
						</div>
						<div>
							<div className="text-xs text-zinc-500">Job ID</div>
							<div className="mt-1 font-mono text-sm text-zinc-300 break-all">{incident.jobId}</div>
						</div>
						<div>
							<div className="text-xs text-zinc-500">Created</div>
							<div className="mt-1 text-sm text-zinc-300">{new Date(incident.createdAt).toLocaleString()}</div>
						</div>
						<div>
							<div className="text-xs text-zinc-500">Updated</div>
							<div className="mt-1 text-sm text-zinc-300">{new Date(incident.updatedAt).toLocaleString()}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default IncidentDetailPage;
