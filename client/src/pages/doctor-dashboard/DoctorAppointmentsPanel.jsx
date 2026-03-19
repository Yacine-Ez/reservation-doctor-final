import { Skeleton } from "@mantine/core";
import { updateAppointmentStatus } from "../../services/api";

function DoctorAppointmentsPanel({ appointments, loadingAppointments, onAppointmentsChange }) {
  const handleStatus = async (appointment, status) => {
    const updated = await updateAppointmentStatus(appointment.id, status);
    onAppointmentsChange((prev) =>
      prev.map((appt) => (appt.id === updated.data.id ? updated.data : appt))
    );
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Rendez-vous</h2>
      {loadingAppointments ? (
        <div className="mt-4 space-y-3">
          <Skeleton height={48} radius="xl" />
          <Skeleton height={48} radius="xl" />
          <Skeleton height={48} radius="xl" />
        </div>
      ) : appointments.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Aucun rendez-vous pour le moment.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{appt.doctorName}</div>
                  <div className="text-xs text-slate-500">{appt.specialty}</div>
                  <div className="mt-2 text-xs text-slate-600">{appt.slot}</div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {appt.status}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleStatus(appt, "confirmed")}
                  className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-white"
                >
                  Confirmer
                </button>
                <button
                  type="button"
                  onClick={() => handleStatus(appt, "cancelled")}
                  className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white"
                >
                  Annuler
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointmentsPanel;
