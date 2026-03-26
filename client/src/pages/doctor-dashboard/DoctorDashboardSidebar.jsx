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
  isOpen,
}) {
  return (
    <aside
      className={`relative rounded-3xl border border-cyan-100 bg-white p-4 shadow-sm transition-all lg:sticky lg:top-6 lg:min-h-[78vh] lg:-ml-4 ${
        isOpen ? "w-full lg:w-64" : "hidden lg:block lg:w-20"
      }`}
    >
      {isOpen && (
        <div className="mb-4 rounded-2xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Doctor Space</p>
          <p className="mt-1 font-semibold text-slate-900">
            {myDoctorCard?.name || "Complete your profile"}
          </p>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto lg:flex-col lg:space-y-2 lg:overflow-visible">
        <button
          type="button"
          onClick={onShowProfile}
          className="whitespace-nowrap rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 lg:w-full"
        >
          {isOpen ? "Profile" : "P"}
        </button>
        <button
          type="button"
          onClick={onShowChat}
          className="whitespace-nowrap rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 lg:w-full"
        >
          {isOpen ? "Chat / Patients" : "C"}
        </button>
        <button
          type="button"
          onClick={onShowOnboarding}
          className="whitespace-nowrap rounded-xl bg-cyan-600 px-3 py-2 text-left text-sm font-semibold text-white lg:w-full"
        >
          {isOpen ? (myDoctorCardId ? "Modify My Card" : "Create My Card") : "M"}
        </button>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto border-t border-slate-200 pt-4 lg:flex-col lg:space-y-2 lg:overflow-visible">
        <button
          type="button"
          onClick={onGoHome}
          className="whitespace-nowrap rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 lg:w-full"
        >
          {isOpen ? "Home" : "H"}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-left text-sm font-semibold text-white lg:w-full"
        >
          {isOpen ? "Logout" : "L"}
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3">
        <button
          type="button"
          onClick={onShowAppointments}
          className="flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
        >
          {isOpen ? "Rendez-vous" : "RDV"}
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
