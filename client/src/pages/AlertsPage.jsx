import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAlerts, markAlertRead } from "../features/alerts/alertsSlice";

const LIMIT = 10;

const timeAgo = (iso) => {
	const diff = Date.now() - new Date(iso).getTime();
	const m = Math.floor(diff / 60000);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
};

const typeStyles = {
	CRITICAL: { label: "CRITICAL", bg: "bg-red-900/30 text-red-400 border-red-900/40" },
	WARNING: { label: "WARNING", bg: "bg-amber-900/30 text-amber-400 border-amber-900/40" },
	PERFORMANCE_ANOMALY: { label: "ANOMALY", bg: "bg-purple-900/30 text-purple-400 border-purple-900/40" },
	INFO: { label: "INFO", bg: "bg-blue-900/30 text-blue-400 border-blue-900/40" },
};

const AlertsPage = () => {
	const dispatch = useDispatch();
	const alerts = useSelector((state) => state.alerts.alerts);
	const loading = useSelector((state) => state.alerts.loading);
	const unreadCount = useSelector((state) => state.alerts.unreadCount);

	const [activeFilter, setActiveFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		dispatch(fetchAlerts());
	}, [dispatch]);

	const filtered = useMemo(() => {
		return alerts
			.filter((a) => activeFilter === "all" || a.type === activeFilter)
			.filter((a) =>
				(a.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
				(a.message || "").toLowerCase().includes(searchQuery.toLowerCase()),
			);
	}, [alerts, activeFilter, searchQuery]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));
	const paginated = filtered.slice((currentPage - 1) * LIMIT, currentPage * LIMIT);

	useEffect(() => {
		setCurrentPage(1);
	}, [activeFilter, searchQuery]);

	const typeKeys = [...new Set(alerts.map((a) => a.type))];

	return (
		<div className="min-h-screen bg-zinc-950 p-6 text-zinc-50">
			<div className="mx-auto max-w-6xl space-y-6">
				{/* Header */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Notifications</div>
						<h1 className="mt-2 text-3xl font-semibold">Alert Feed</h1>
						<p className="mt-2 text-sm text-zinc-300">All system notifications and alerts in one place.</p>
					</div>
					{unreadCount > 0 && (
						<div className="rounded-full bg-red-900/30 border border-red-900/40 px-4 py-2 text-sm font-mono text-red-400">
							{unreadCount} unread
						</div>
					)}
				</div>

				{/* Summary cards */}
				<div className="grid gap-4 md:grid-cols-3">
					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
						<div className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">Total</div>
						<div className="mt-3 font-mono text-4xl font-semibold text-zinc-50">{alerts.length}</div>
					</div>
					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
						<div className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">Unread</div>
						<div className="mt-3 font-mono text-4xl font-semibold text-red-400">{unreadCount}</div>
					</div>
					<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
						<div className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">Read</div>
						<div className="mt-3 font-mono text-4xl font-semibold text-green-400">{alerts.length - unreadCount}</div>
					</div>
				</div>

				{/* Filters + Search */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center">
					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={() => setActiveFilter("all")}
							className={`rounded-full px-3 py-2 text-xs font-mono uppercase tracking-widest transition ${activeFilter === "all" ? "bg-orange-400 text-zinc-950" : "border border-zinc-700 bg-zinc-900 text-zinc-300"}`}
						>
							All
						</button>
						{typeKeys.map((type) => (
							<button
								key={type}
								type="button"
								onClick={() => setActiveFilter(type)}
								className={`rounded-full px-3 py-2 text-xs font-mono uppercase tracking-widest transition ${activeFilter === type ? "bg-orange-400 text-zinc-950" : "border border-zinc-700 bg-zinc-900 text-zinc-300"}`}
							>
								{type?.replace(/_/g, " ") || type}
							</button>
						))}
					</div>
					<div className="flex-1">
						<div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2">
							<input
								placeholder="Search alerts..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full bg-transparent text-sm text-zinc-50 outline-none placeholder:text-zinc-500"
							/>
						</div>
					</div>
				</div>

				{/* Alerts List */}
				{loading ? (
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-24 animate-pulse rounded-xl border border-zinc-700 bg-zinc-900" />
						))}
					</div>
				) : paginated.length ? (
					<div className="space-y-3">
						{paginated.map((alert) => {
							const meta = typeStyles[alert.type] ?? { label: alert.type, bg: "bg-zinc-800 text-zinc-400" };

							return (
								<div
									key={alert._id}
									className={`rounded-xl border p-4 transition ${alert.isRead ? "border-zinc-700 bg-zinc-900" : "border-orange-400/40 bg-orange-950/20"}`}
								>
									<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
										<div className="flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<span className={`rounded border px-2 py-1 text-xs font-mono uppercase tracking-widest ${meta.bg}`}>
													{meta.label}
												</span>
												{!alert.isRead && (
													<span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
												)}
											</div>
											<h3 className="mt-2 text-sm font-semibold text-zinc-50">{alert.title}</h3>
											<p className="mt-1 text-sm text-zinc-300">{alert.message}</p>
										</div>
										<div className="flex shrink-0 flex-col items-end gap-2">
											<span className="text-xs text-zinc-500">{timeAgo(alert.timestamp)}</span>
											{!alert.isRead && (
												<button
													type="button"
													onClick={() => dispatch(markAlertRead(alert._id))}
													className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
												>
													Mark read
												</button>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="flex min-h-40 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-zinc-500">
						No alerts found.
					</div>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between">
						<button
							type="button"
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage <= 1}
							className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
						>
							← Prev
						</button>
						<div className="font-mono text-sm text-zinc-500">
							{currentPage} / {totalPages}
						</div>
						<button
							type="button"
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage >= totalPages}
							className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
						>
							Next →
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default AlertsPage;