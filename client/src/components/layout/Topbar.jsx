import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { clearUser, logoutUser } from "../../features/auth/authSlice";
import { fetchAlerts } from "../../features/alerts/alertsSlice";
import toast from "react-hot-toast";

const timeAgo = (iso) => {
	const diff = Date.now() - new Date(iso).getTime();
	const m = Math.floor(diff / 60000);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
};

const Topbar = () => {
	const [query, setQuery] = useState("");
	const [showNotifications, setShowNotifications] = useState(false);
	const [showUserMenu, setShowUserMenu] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const user = useSelector((state) => state.auth.user);
	const alerts = useSelector((state) => state.alerts.alerts);
	const unreadCount = useSelector((state) => state.alerts.unreadCount);
	const notificationsRef = useRef(null);
	const userMenuRef = useRef(null);

	useEffect(() => {
		dispatch(fetchAlerts());
	}, [dispatch]);

	const firstName = user?.name?.firstName ?? user?.firstName ?? "";
	const lastName = user?.name?.lastName ?? user?.lastName ?? "";
	const fallbackName = user?.email ? user.email.split("@")[0] : "User";
	const fullName = `${firstName} ${lastName}`.trim() || fallbackName;
	const initials =
		(firstName?.[0] ?? "") +
		(lastName?.[0] ?? "") ||
		fallbackName.slice(0, 2).toUpperCase();
	const avatarUrl = user?.avatar || user?.picture || user?.photo || user?.image || "";

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
				setShowNotifications(false);
			}
			if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
				setShowUserMenu(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = async () => {
		try {
			await dispatch(logoutUser()).unwrap();
		} catch {
			// Ignore network/API failures and force local sign-out.
		} finally {
			dispatch(clearUser());
			setShowUserMenu(false);
			toast.success("Signed out successfully");
			navigate("/login", { replace: true });
		}
	};

	const titleMap = {
		"/dashboard": "Overview",
		"/dashboard/monitors": "Monitors",
		"/dashboard/incidents": "Incidents",
		"/dashboard/alerts": "Alerts",
		"/dashboard/settings": "Settings",
	};

	const activeTitle =
		titleMap[location.pathname] ??
		(location.pathname.startsWith("/dashboard/monitors") ? "Monitors" : "Dashboard");

	return (
		<header className="flex items-center justify-between gap-4 border-b border-[#334155] bg-[#020617] px-6 py-4 text-[#f8fafc]">
			<div className="flex flex-1 items-center gap-4">
				<div className="text-xl font-semibold">{activeTitle}</div>
				<div className="hidden max-w-xl flex-1 lg:block">
					<div className="flex items-center gap-3 rounded-lg border border-[#334155] bg-[#0f172a] px-4 py-2 text-[#64748b]">
						<span>⌕</span>
						<input
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search systems..."
							className="w-full bg-transparent text-sm text-[#f8fafc] outline-none placeholder:text-[#64748b]"
						/>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-4 text-[#cbd5e1]">
				<div className="relative" ref={notificationsRef}>
					<button
						type="button"
						onClick={() => {
							setShowNotifications((prev) => !prev);
							setShowUserMenu(false);
						}}
						className="relative rounded-full border border-[#334155] p-2 hover:bg-[#1e293b] hover:text-[#f8fafc]"
						aria-label="Notifications"
					>
						🔔
						{unreadCount > 0 && (
							<span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
								{unreadCount > 9 ? "9+" : unreadCount}
							</span>
						)}
					</button>
					{showNotifications ? (
						<div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-[#334155] bg-[#0f172a] p-3 shadow-2xl">
							<p className="mb-2 text-xs uppercase tracking-wider text-[#64748b]">
								Notifications {unreadCount > 0 && `(${unreadCount} new)`}
							</p>
							<div className="max-h-80 space-y-2 overflow-y-auto">
								{alerts.length ? (
									alerts.slice(0, 5).map((item) => (
										<div key={item._id} className={`rounded-lg border p-2 ${item.isRead ? "border-[#334155] bg-[#1e293b]" : "border-orange-400/40 bg-orange-950/20"}`}>
											<div className="flex items-start justify-between gap-2">
												<p className="text-sm font-medium text-[#f8fafc]">{item.title}</p>
												{!item.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-400 animate-pulse" />}
											</div>
											<p className="mt-0.5 text-xs text-[#cbd5e1] line-clamp-2">{item.message}</p>
											<p className="mt-1 text-[11px] text-[#64748b]">{timeAgo(item.timestamp)}</p>
										</div>
									))
								) : (
									<p className="py-4 text-center text-sm text-[#64748b]">No notifications yet</p>
								)}
							</div>
							{alerts.length > 5 && (
								<button
									type="button"
									onClick={() => { navigate("/dashboard/alerts"); setShowNotifications(false); }}
									className="mt-2 w-full rounded-lg py-2 text-center text-xs font-mono uppercase tracking-widest text-orange-400 hover:bg-[#1e293b]"
								>
									View all alerts
								</button>
							)}
						</div>
					) : null}
				</div>

				{/* <button type="button" className="rounded p-2 hover:bg-[#111118] hover:text-white" aria-label="Quick actions">
					◫
				</button> */}
				<div className="relative" ref={userMenuRef}>
					<button
						type="button"
						onClick={() => {
							setShowUserMenu((prev) => !prev);
							setShowNotifications(false);
						}}
						className="h-9 w-9 overflow-hidden rounded-full border border-[#334155] bg-[#1e293b]"
						aria-label="Open user menu"
					>
						{avatarUrl ? (
							<img alt="Profile" src={avatarUrl} className="h-full w-full object-cover" />
						) : (
							<span className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#f8fafc]">
								{initials.toUpperCase()}
							</span>
						)}
					</button>
					{showUserMenu ? (
						<div className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-[#334155] bg-[#0f172a] p-3 shadow-2xl">
							<p className="truncate text-sm font-medium text-[#f8fafc]">{fullName}</p>
							<p className="truncate text-xs text-[#cbd5e1]">{user?.email || "No email"}</p>
							<div className="mt-3 border-t border-[#334155] pt-2">
								<button
									type="button"
									onClick={() => {
										navigate("/dashboard/settings");
										setShowUserMenu(false);
									}}
									className="w-full rounded-full px-2 py-1.5 text-left text-sm text-zinc-200 hover:bg-[#1e293b]"
								>
									Profile settings
								</button>
								<button
									type="button"
									onClick={handleLogout}
									className="mt-1 w-full rounded-full px-2 py-1.5 text-left text-sm text-[#fb7185] hover:bg-[#1e293b]"
								>
									Sign out
								</button>
							</div>
						</div>
					) : null}
				</div>
			</div>
		</header>
	);
};

export default Topbar;
