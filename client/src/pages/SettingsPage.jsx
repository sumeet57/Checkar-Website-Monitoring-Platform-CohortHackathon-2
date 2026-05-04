import { useEffect } from "react";
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

const SettingsPage = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector((state) => state.auth.user);
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
			<div className="mx-auto max-w-7xl space-y-6">
				<div>
					<div className="mb-4 text-xs font-mono uppercase tracking-widest text-[#64748b]">Settings</div>
					<h1 className="text-3xl font-semibold">Profile and preferences</h1>
					<p className="mt-2 text-sm text-[#cbd5e1]">Update your profile, notification preferences, and session controls.</p>
				</div>

				<div className="">
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
						<div className="space-y-6 py-5">
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
		</div>
	);
};

export default SettingsPage;