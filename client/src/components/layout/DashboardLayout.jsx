import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DashboardLayout = () => {
	return (
		<div className="flex min-h-screen w-full bg-[#020617] text-[#f8fafc]">
			<Sidebar />
			<div className="flex flex-1 flex-col overflow-hidden lg:ml-70">
				<Topbar />
				<main className="flex-1 overflow-y-auto">
					<Outlet />
				</main>
			</div>
		</div>
	);
};

export default DashboardLayout;