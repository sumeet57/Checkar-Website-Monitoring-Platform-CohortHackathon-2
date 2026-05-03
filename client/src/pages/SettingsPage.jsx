import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { clearUser, logoutUser, updateUserProfile } from "../features/auth/authSlice";

const schema = z.object({
	firstName: z.string().min(2).max(50),
	lastName: z.string().min(2).max(50),
});

const Toggle = ({ enabled, onChange }) => (
	<button
		type="button"
		onClick={() => onChange(!enabled)}
		className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${enabled ? "bg-[#fb923c]" : "bg-[#334155]"}`}
	>
		<span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enabled ? "translate-x-6" : "translate-x-1"}`} />
	</button>
);

const SettingsPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector((state) => state.auth.user);
	const monitors = useSelector((state) => state.jobs.jobs);
	const [notifPrefs, setNotifPrefs] = useState({
		siteDown: true,
		recovery: true,
		ssl: true,
		anomaly: false,
	});

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: { firstName: "", lastName: "" },
	});

	useEffect(() => {
		const firstName = user?.name?.firstName ?? user?.firstName ?? "";
		const lastName = user?.name?.lastName ?? user?.lastName ?? "";
		reset({ firstName, lastName });
	}, [reset, user]);

	const initials = [user?.name?.firstName?.[0], user?.name?.lastName?.[0]].filter(Boolean).join("").toUpperCase();
	const capacity = 42;
	const usedCapacity = Math.min(monitors.length, capacity);
	const capacityPct = Math.round((usedCapacity / capacity) * 100);

	const onSubmit = async (data) => {
		try {
			await dispatch(updateUserProfile(data)).unwrap();
			toast.success("Profile updated");
		} catch (err) {
			toast.error(err || "Failed to update profile");
		}
	};

	const handleLogout = async () => {
		try {
			await dispatch(logoutUser()).unwrap();
			navigate("/login");
		} catch {
			// Ignore network/API failures and force local sign-out.
		} finally {
			dispatch(clearUser());
			toast.success("Signed out successfully");
			navigate("/login", { replace: true });
		}
	};

	return (
		<div className="min-h-screen bg-[#020617] p-6 text-[#f8fafc]">
			<div className="mx-auto max-w-6xl space-y-6">
				<div>
					<div className="mb-4 text-xs font-mono uppercase tracking-widest text-[#64748b]">Settings</div>
					<h1 className="text-3xl font-semibold">Profile and preferences</h1>
					<p className="mt-2 text-sm text-[#cbd5e1]">Update your profile, notification preferences, and session controls.</p>
				</div>

				<div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
					<div className="rounded-xl border border-[#334155] bg-[#0f172a] p-6">
						<div className="mb-4 flex items-start justify-between">
							<div>
								<div className="text-xs uppercase tracking-[0.3em] text-[#64748b]">Personal information</div>
								<div className="mt-2 text-sm text-[#cbd5e1]">Manage your public profile and account identity.</div>
							</div>
							<div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#fb923c]/30 bg-orange-950 text-xl font-semibold text-[#fed7aa]">{initials || "AD"}</div>
						</div>
						<div className="text-sm font-mono text-[#f8fafc]">{user?.name?.firstName || "Admin"} {user?.name?.lastName || "User"}</div>
						<div className="mt-1 text-xs text-[#64748b]">{user?.email}</div>
						<form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label className="mb-2 block text-xs font-mono uppercase tracking-widest text-[#64748b]">First name</label>
									<input {...register("firstName")} className="w-full rounded-lg border border-[#334155] bg-[#020617] px-3 py-2 text-sm text-[#f8fafc] outline-none focus:border-[#fb923c]" />
									{errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>}
								</div>
								<div>
									<label className="mb-2 block text-xs font-mono uppercase tracking-widest text-[#64748b]">Last name</label>
									<input {...register("lastName")} className="w-full rounded-lg border border-[#334155] bg-[#020617] px-3 py-2 text-sm text-[#f8fafc] outline-none focus:border-[#fb923c]" />
									{errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>}
								</div>
							</div>
							<div>
								<div className="mb-2 text-xs font-mono uppercase tracking-widest text-[#64748b]">Email address (read-only)</div>
								<input value={user?.email || ""} disabled className="w-full cursor-not-allowed rounded-lg border border-[#334155] bg-[#020617] px-3 py-2 text-sm text-[#f8fafc] opacity-50 outline-none" />
							</div>
							<div className="flex gap-3">
								<button type="submit" disabled={isSubmitting} className="rounded-full bg-[#fb923c] px-4 py-2 text-sm font-mono text-[#020617] shadow-glow-orange hover:bg-[#f97316] disabled:cursor-not-allowed disabled:opacity-50">Save changes</button>
								<button type="button" onClick={() => navigate("/dashboard/settings")} className="rounded-full border border-[#334155] px-4 py-2 text-sm text-[#cbd5e1] hover:bg-[#1e293b]">Cancel</button>
							</div>
						</form>
					</div>

					<div className="space-y-6">
						<div className="rounded-xl border border-[#334155] bg-[#0f172a] p-6">
							<div className="mb-4 text-xs font-mono uppercase tracking-widest text-[#64748b]">Notification Preferences</div>
							<div className="space-y-4">
								{[
									["siteDown", "Site down"],
									["recovery", "Recovery"],
									["ssl", "SSL"],
									["anomaly", "Anomaly"],
								].map(([key, label]) => (
									<div key={key} className="flex items-center justify-between gap-4">
										<div>
											<div className="text-sm text-[#f8fafc]">{label}</div>
											<div className="text-xs text-[#64748b]">Toggle alert delivery for this event.</div>
										</div>
										<Toggle enabled={notifPrefs[key]} onChange={(value) => setNotifPrefs((prev) => ({ ...prev, [key]: value }))} />
									</div>
								))}
							</div>
						</div>

						<div className="rounded-xl border border-[#334155] bg-[#0f172a] p-6">
							<div className="mb-4 text-xs font-mono uppercase tracking-widest text-[#64748b]">Professional Plan</div>
							<div className="text-sm text-[#cbd5e1]">Monitor capacity and billing details at a glance.</div>
							<div className="mt-4">
								<div className="mb-2 flex items-center justify-between text-xs text-[#64748b]"><span>Monitor Capacity</span><span>{usedCapacity}/{capacity}</span></div>
								<div className="h-2 rounded-full bg-[#020617]"><div className="h-full rounded-full bg-[#fb923c]" style={{ width: `${capacityPct}%` }} /></div>
							</div>
							<button type="button" className="mt-4 w-full rounded-full border border-[#334155] px-4 py-2 text-sm text-[#f8fafc] hover:bg-[#1e293b]">View billing history</button>
						</div>

						<div className="rounded-xl border border-[#7f1d1d] bg-orange-950 p-4">
							<div className="mb-4 text-xs font-mono uppercase tracking-widest text-[#fca5a5]">Danger zone</div>
							<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
								<div>
									<div className="text-sm text-[#f8fafc]">Sign out of this session</div>
									<div className="text-xs text-[#fed7aa]">This clears your server session and returns you to the homepage.</div>
								</div>
								<button type="button" onClick={handleLogout} className="rounded-full border border-red-800 px-4 py-2 text-sm text-red-500 hover:bg-red-900/20">Sign out</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsPage;