import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteJob, fetchJobs, updateJob } from "../features/jobs/jobsSlice";

const filterOptions = ["all", "api", "server", "ssl", "port", "frontend"];

const statusClasses = {
	up: "bg-green-900/30 text-green-400",
	down: "bg-red-900/30 text-red-400",
	pending: "bg-zinc-800 text-zinc-400",
};

const truncate = (value, length = 35) => {
	if (!value) {
		return "-";
	}

	return value.length > length ? `${value.slice(0, length)}...` : value;
};

const getIntervalLabel = (interval = 0) => {
	if (interval >= 86400) {
		return "daily";
	}

	if (interval >= 3600) {
		return `${Math.round(interval / 3600)}h`;
	}

	if (interval >= 60) {
		return `${Math.round(interval / 60)}m`;
	}

	return `${interval}s`;
};

const buildUptimeBars = () => Array.from({ length: 16 }, (_, index) => index);

const SummaryCard = ({ label, value, sub, accent = "bg-[#7c3aed]" }) => (
	<div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
		<div className="text-[11px] uppercase tracking-[0.35em] text-zinc-500">{label}</div>
		<div className="mt-3 font-mono text-4xl font-semibold text-zinc-50">{value}</div>
		<div className="mt-2 text-xs text-zinc-400">{sub}</div>
		{label.toLowerCase().includes("uptime") && (
			<div className="mt-4 flex gap-1">
				{buildUptimeBars().map((bar) => (
					<div
						key={bar}
						className={`h-10 flex-1 rounded-sm ${bar === 4 ? "bg-red-500" : accent}`}
					/>
				))}
			</div>
		)}
	</div>
);

const MonitorsPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const jobs = useSelector((state) => state.jobs.jobs);
	const pagination = useSelector((state) => state.jobs.pagination);
	const loading = useSelector((state) => state.jobs.loading);

	const [activeFilter, setActiveFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [deleteConfirmId, setDeleteConfirmId] = useState(null);
	const [openMenuId, setOpenMenuId] = useState(null);
	const menuBtnRefs = useRef({});

	const getMenuPosition = () => {
		if (!openMenuId || !menuBtnRefs.current[openMenuId]) return null;
		const rect = menuBtnRefs.current[openMenuId].getBoundingClientRect();
		return { top: rect.bottom + 4, left: rect.right - 176 };
	};

	useEffect(() => {
		dispatch(fetchJobs({ page: pagination.page ?? 1, limit: 10 }));
	}, [dispatch, pagination.page]);

	const filtered = useMemo(
		() =>
			jobs
				.filter((job) => activeFilter === "all" || job.type === activeFilter)
				.filter(
					(job) =>
						job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						job.url?.toLowerCase().includes(searchQuery.toLowerCase()),
				),
		[activeFilter, jobs, searchQuery],
	);

	const handleDelete = async () => {
		if (!deleteConfirmId) {
			return;
		}

		await dispatch(deleteJob(deleteConfirmId));
		toast.success("Monitor deleted");
		setDeleteConfirmId(null);
	};

	const handleToggleActive = (job) => {
		dispatch(updateJob({ id: job._id, data: { isActive: !job.isActive } }));
		setOpenMenuId(null);
	};

	const handlePageChange = (newPage) => {
		dispatch(fetchJobs({ page: newPage, limit: 10 }));
	};

	const total = jobs.length;
	const up = jobs.filter((job) => job.lastStatus === "up").length;
	const active = jobs.filter((job) => job.isActive).length;
	const avgLatency = total ? Math.round(jobs.reduce((sum, job) => sum + (job.lastLatency || 0), 0) / total) : 0;

	return (
		<div className="min-h-screen bg-zinc-950 p-6 text-zinc-50">
			<div className="mx-auto max-w-7xl space-y-6">
				<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
					<div>
						<div className="text-xs uppercase tracking-[0.3em] text-zinc-500">System Monitors</div>
						<h1 className="mt-2 text-3xl font-semibold">Monitor inventory</h1>
						<p className="mt-2 text-sm text-zinc-300">Manage and inspect every endpoint currently being observed.</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row">
						<input
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
							placeholder="Search systems..."
							className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 sm:w-80"
						/>
						<button
							type="button"
							onClick={() => navigate("/dashboard/monitors/new")}
							className="rounded-full bg-orange-400 px-4 py-2 text-sm font-mono text-zinc-950 shadow-glow-orange transition hover:bg-orange-500"
						>
							Add monitor
						</button>
					</div>
				</div>

				<div className="flex flex-wrap gap-2 border-b border-zinc-700 pb-4">
					{filterOptions.map((filter) => (
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

				<div className="overflow-x-auto rounded-xl border border-zinc-700 bg-zinc-900">
					<table className="w-full border-collapse">
						<thead>
							<tr>
								{[
									"Name",
									"Type",
									"URL/Host",
									"Status",
									"Latency",
									"Checks",
									"Interval",
									"Actions",
								].map((column) => (
									<th
										key={column}
											className="bg-zinc-950 px-4 py-3 text-left font-mono text-xs uppercase tracking-widest text-zinc-500"
									>
										{column}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{loading ? (
								Array.from({ length: 4 }).map((_, index) => (
									<tr key={index}>
											<td colSpan={8} className="border-b border-zinc-700 px-4 py-4">
												<div className="h-5 w-full animate-pulse rounded bg-zinc-800" />
										</td>
									</tr>
								))
							) : filtered.length ? (
								filtered.map((job) => (
									<tr key={job._id} className="relative transition hover:bg-zinc-800">
										<td className="border-b border-zinc-700 px-4 py-3 text-sm text-zinc-50">{job.title}</td>
										<td className="border-b border-[#1e1e2e] px-4 py-3 text-sm">
											<span className="rounded-full bg-zinc-800 px-2 py-1 font-mono text-xs uppercase tracking-widest text-zinc-300">
												{job.type}
											</span>
										</td>
										<td className="border-b border-zinc-700 px-4 py-3 text-sm text-zinc-300">
											{job.type === "port" ? `${job.host}:${job.port}` : truncate(job.url)}
										</td>
										<td className="border-b border-zinc-700 px-4 py-3 text-sm">
											<span className={`rounded px-2 py-1 text-xs font-mono uppercase tracking-widest ${statusClasses[job.lastStatus] ?? statusClasses.pending}`}>
												{job.lastStatus}
											</span>
										</td>
										<td className="border-b border-zinc-700 px-4 py-3 text-sm font-mono text-zinc-300">
											{job.lastLatency ?? 0} ms
										</td>
										<td className="border-b border-zinc-700 px-4 py-3 text-sm font-mono text-zinc-300">
											{job.stats?.totalChecks ?? 0}
										</td>
										<td className="border-b border-zinc-700 px-4 py-3 text-sm font-mono text-zinc-300">
											{getIntervalLabel(job.interval ?? job.intervalSeconds ?? 0)}
										</td>
										<td className="border-b border-zinc-700 px-4 py-3 text-sm">
											<div className="relative inline-block text-left">
												<button
													ref={(el) => { menuBtnRefs.current[job._id] = el; }}
													type="button"
													onClick={() => setOpenMenuId(openMenuId === job._id ? null : job._id)}
													className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-800"
												>
													⋯
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={8} className="px-4 py-12 text-center text-sm text-zinc-500">
										No monitors match the current filters.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div className="flex items-center justify-between text-sm text-[#6b7280]">
					<div>
						Page {pagination.page ?? 1} of {pagination.totalPages ?? 1}
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => handlePageChange(Math.max(1, (pagination.page ?? 1) - 1))}
							className="rounded-full border border-zinc-700 px-3 py-2 hover:bg-zinc-800"
						>
							Previous
						</button>
						<button
							type="button"
							onClick={() => handlePageChange(Math.min(pagination.totalPages ?? 1, (pagination.page ?? 1) + 1))}
							className="rounded-full border border-zinc-700 px-3 py-2 hover:bg-zinc-800"
						>
							Next
						</button>
					</div>
				</div>
			</div>

					{/* <div className="grid gap-4 md:grid-cols-3">
						<SummaryCard label="System uptime" value="99.998%" sub={`${up} healthy monitors`} accent="bg-emerald-400" />
						<SummaryCard label="Avg latency" value={`${avgLatency}ms`} sub="Across current checks" accent="bg-orange-400" />
						<SummaryCard label="Active incidents" value={jobs.filter((job) => job.lastStatus === "down").length} sub={`${active} active monitors`} accent="bg-red-500" />
					</div> */}

			{deleteConfirmId && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
					<div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-zinc-50">
						<h2 className="text-xl font-semibold">Delete this monitor?</h2>
						<p className="mt-2 text-sm text-zinc-300">All logs will be permanently removed.</p>
						<div className="mt-6 flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setDeleteConfirmId(null)}
								className="rounded-full border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleDelete}
								className="rounded-full bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			)}

			{openMenuId && getMenuPosition() && createPortal(
				<div
					className="fixed z-9999 w-44 rounded-xl border border-zinc-700 bg-zinc-950 p-2 shadow-lg"
					style={{ top: getMenuPosition().top, left: getMenuPosition().left }}
				>
					<button
						type="button"
						onClick={() => {
							navigate(`/dashboard/monitors/${openMenuId}`);
							setOpenMenuId(null);
						}}
						className="block w-full rounded-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800"
					>
						View details
					</button>
					<button
						type="button"
						onClick={() => {
							navigate(`/dashboard/monitors/${openMenuId}/edit`);
							setOpenMenuId(null);
						}}
						className="block w-full rounded-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800"
					>
						Edit
					</button>
					<button
						type="button"
						onClick={() => {
							const job = jobs.find((j) => j._id === openMenuId);
							if (job) handleToggleActive(job);
						}}
						className="block w-full rounded-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800"
					>
						{jobs.find((j) => j._id === openMenuId)?.isActive ? "Pause" : "Resume"}
					</button>
					<button
						type="button"
						onClick={() => {
							setDeleteConfirmId(openMenuId);
							setOpenMenuId(null);
						}}
						className="block w-full rounded-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-950/40"
					>
						Delete
					</button>
				</div>,
				document.body
			)}
		</div>
	);
};

export default MonitorsPage;
