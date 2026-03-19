import { Skeleton } from "@mantine/core";

function DoctorDashboardSidebar({
  myDoctorCard,
  myDoctorCardId,
  appointments,
  loadingAppointments,
  onShowProfile,
  onShowChat,
  onShowAppointments,
  onShowOnboarding,
  onGoHome,
  onLogout,
}) {
  return (
    <aside className="sticky top-6 min-h-[78vh] rounded-3xl border border-cyan-100 bg-white p-4 shadow-sm lg:-ml-4">
      <div className="mb-4 rounded-2xl bg-slate-50 p-3">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Doctor Space</p>
        <p className="mt-1 font-semibold text-slate-900">{myDoctorCard?.name || "Complete your profile"}</p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onShowProfile}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700"
        >
          Profile
        </button>
        <button
          type="button"
          onClick={onShowChat}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700"
        >
          Chat / Patients
        </button>
        <button
          type="button"
          onClick={onShowOnboarding}
          className="w-full rounded-xl bg-cyan-600 px-3 py-2 text-left text-sm font-semibold text-white"
        >
          {myDoctorCardId ? "Modify My Card" : "Create My Card"}
        </button>
      </div>

      <div className="mt-6 space-y-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onGoHome}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700"
        >
          Home
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl bg-slate-900 px-3 py-2 text-left text-sm font-semibold text-white"
        >
          Logout
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3">
        <button
          type="button"
          onClick={onShowAppointments}
          className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
        >
          Rendez-vous
          <span className="text-[10px]">{loadingAppointments ? "…" : appointments?.length || 0}</span>
        </button>
        {loadingAppointments && (
          <div className="mt-3 space-y-2">
            <Skeleton height={10} radius="xl" />
            <Skeleton height={10} radius="xl" />
          </div>
        )}
      </div>
    </aside>
  );
}

export default DoctorDashboardSidebar;
