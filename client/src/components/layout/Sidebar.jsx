import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const navItems = [
	{ label: "Overview", to: "/dashboard" },
	{ label: "Monitors", to: "/dashboard/monitors" },
	{ label: "Incidents", to: "/dashboard/incidents" },
	{ label: "Alerts", to: "/dashboard/alerts" },
	{ label: "Settings", to: "/dashboard/settings" },
];

const Sidebar = () => {
	const unreadCount = useSelector((state) => state.alerts.unreadCount ?? 0);
	const navigate = useNavigate();
	return (
		<aside className="hidden fixed top-0 left-0 z-50 w-70 min-h-screen shrink-0 border-r border-[#334155] bg-[#0f172a] px-5 py-6 text-[#f8fafc] lg:flex lg:flex-col">
			<div>
				<div className="text-2xl font-semibold tracking-tight">Checkar</div>
				<div className="mt-2 text-[11px] uppercase tracking-[0.35em] text-[#64748b]">System node: 01</div>
			</div>

			<nav className="mt-10 space-y-1">
				{navItems.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						end={item.to === "/dashboard"}
						className={({ isActive }) =>
							`flex items-center justify-between rounded-xl border-l-2 px-4 py-3 text-sm transition ${isActive ? "border-[#fb923c] bg-[#1e293b] text-[#f8fafc]" : "border-transparent text-[#cbd5e1] hover:bg-[#1e293b] hover:text-[#f8fafc]"}`
						}
					>
						<span>{item.label}</span>
						{item.label === "Alerts" && unreadCount > 0 && (
							<span className="rounded-full bg-[#fb923c] px-2 py-0.5 text-[10px] font-mono text-[#020617]">{unreadCount}</span>
						)}
					</NavLink>
				))}
			</nav>

			<div className="mt-auto space-y-4">
				<button
					type="button"
					onClick={() => navigate("/dashboard/monitors/new")}
					className="cursor-pointer w-full rounded-full bg-[#fb923c] px-4 py-3 text-sm font-semibold text-[#020617] shadow-glow-orange transition hover:bg-[#f97316]"
				>
					New Monitor
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
