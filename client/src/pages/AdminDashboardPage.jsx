import { Link } from"react-router-dom";

const AdminDashboardPage = () => (
 <div className="p-6 max-w-6xl mx-auto animate-fade-in">
 <div className="mb-8">
 <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
 Admin dashboard
 </h1>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
 Manage the platform at a glance and keep the experience running
 smoothly.
 </p>
 </div>

 <div className="grid gap-4 md:grid-cols-3">
 <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
 Users
 </p>
 <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
 1,284
 </p>
 </div>
 <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
 Books
 </p>
 <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
 328
 </p>
 </div>
 <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
 Revenue
 </p>
 <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
 $12.4k
 </p>
 </div>
 </div>

 <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
 <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
 Quick actions
 </h2>
 <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
 Review recent activity or jump back to the main workspace.
 </p>
 <div className="mt-4 flex flex-wrap gap-3">
 <Link
 to="/dashboard"
 className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary"
 >
 Open dashboard
 </Link>
 <Link
 to="/settings"
 className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
 >
 Settings
 </Link>
 </div>
 </div>
 </div>
);

export default AdminDashboardPage;

