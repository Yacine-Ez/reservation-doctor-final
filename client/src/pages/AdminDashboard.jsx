import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppointments, getDoctors, getPatients } from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorQuery, setDoctorQuery] = useState("");
  const [appointmentQuery, setAppointmentQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getDoctors().then((res) => setDoctors(res.data || []));
    getPatients().then((res) => setPatients(res.data || []));
    getAppointments().then((res) => setAppointments(res.data || []));
  }, []);

  const now = Date.now();
  const appointmentStats = useMemo(() => {
    const total = appointments.length;
    const upcoming = appointments.filter((appt) => {
      const time = Date.parse(appt.slot || "");
      return Number.isFinite(time) && time >= now;
    }).length;
    const completed = appointments.filter(
      (appt) => String(appt.status || "").toLowerCase() === "completed"
    ).length;
    const cancelled = appointments.filter(
      (appt) =>
        ["cancelled", "canceled"].includes(String(appt.status || "").toLowerCase())
    ).length;
    return { total, upcoming, completed, cancelled };
  }, [appointments, now]);

  const filteredDoctors = useMemo(() => {
    const needle = doctorQuery.trim().toLowerCase();
    if (!needle) return doctors;
    return doctors.filter((doctor) => {
      const name = doctor.name?.toLowerCase() || "";
      const specialty = doctor.specialty?.toLowerCase() || "";
      const location = doctor.location?.toLowerCase() || "";
      return name.includes(needle) || specialty.includes(needle) || location.includes(needle);
    });
  }, [doctors, doctorQuery]);

  const filteredAppointments = useMemo(() => {
    const needle = appointmentQuery.trim().toLowerCase();
    return appointments.filter((appt) => {
      const status = String(appt.status || "").toLowerCase();
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (!needle) return true;
      return (
        String(appt.doctorName || "").toLowerCase().includes(needle) ||
        String(appt.patientName || "").toLowerCase().includes(needle) ||
        String(appt.specialty || "").toLowerCase().includes(needle) ||
        String(appt.slot || "").toLowerCase().includes(needle)
      );
    });
  }, [appointments, appointmentQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <header className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
              Admin Control Center
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Dashboard supervision
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Vue globale: doctors, patients, rendez-vous, activite.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              Systeme actif
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">
              Donnees synchronisees
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("reservation-role");
                navigate("/");
              }}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Quitter
            </button>
          </div>
        </div>
      </header>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">Vue globale des utilisateurs et RDV.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Systeme actif
          </span>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
            Data sync OK
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-cyan-500">Doctors</p>
          <p className="text-2xl font-semibold text-slate-900">{doctors.length}</p>
          <div className="mt-2 h-2 w-full rounded-full bg-cyan-100">
            <div
              className="h-2 rounded-full bg-cyan-500"
              style={{ width: `${Math.min(100, doctors.length * 10)}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-emerald-500">Patients</p>
          <p className="text-2xl font-semibold text-slate-900">{patients.length}</p>
          <div className="mt-2 h-2 w-full rounded-full bg-emerald-100">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{ width: `${Math.min(100, patients.length * 6)}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-indigo-500">RDV</p>
          <p className="text-2xl font-semibold text-slate-900">{appointmentStats.total}</p>
          <p className="mt-2 text-xs text-slate-500">
            {appointmentStats.upcoming} a venir · {appointmentStats.completed} termines ·{" "}
            {appointmentStats.cancelled} annules
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-indigo-100">
            <div
              className="h-2 rounded-full bg-indigo-500"
              style={{
                width:
                  appointmentStats.total === 0
                    ? "0%"
                    : `${Math.round(
                        (appointmentStats.completed / appointmentStats.total) * 100
                      )}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">RDV tracking</h2>
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
              >
                <option value="all">Tous</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <input
                value={appointmentQuery}
                onChange={(event) => setAppointmentQuery(event.target.value)}
                placeholder="Chercher (docteur, patient, date)"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
              />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {filteredAppointments.slice(0, 10).map((appt) => (
              <div key={appt.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{appt.doctorName}</div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase text-slate-500">
                    {appt.status || "pending"}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{appt.specialty}</div>
                <div className="mt-1 text-xs text-slate-600">{appt.slot}</div>
                <div className="text-xs text-slate-500">
                  {appt.patientName || "Patient"} · {appt.paymentMethod || "cash"}{" "}
                  {appt.paymentStatus ? `(${appt.paymentStatus})` : ""}
                </div>
              </div>
            ))}
            {!filteredAppointments.length && (
              <p className="text-sm text-slate-500">Aucun rendez-vous trouve.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Gestion doctors</h2>
            <input
              value={doctorQuery}
              onChange={(event) => setDoctorQuery(event.target.value)}
              placeholder="Chercher doctor"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
            />
          </div>
          <div className="mt-4 space-y-3">
            {filteredDoctors.slice(0, 10).map((doctor) => (
              <div key={doctor.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{doctor.name}</div>
                  <span className="text-[10px] text-slate-500">
                    {doctor.isPremium ? "Premium" : "Standard"}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{doctor.specialty}</div>
                <div className="text-xs text-slate-500">{doctor.location}</div>
                <div className="mt-1 text-xs text-slate-400">
                  Rating: {doctor.rating ? doctor.rating.toFixed(1) : "N/A"}
                </div>
              </div>
            ))}
            {!filteredDoctors.length && (
              <p className="text-sm text-slate-500">Aucun doctor trouve.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Activite recente</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {appointments.slice(0, 4).map((appt) => (
            <div key={appt.id} className="rounded-xl border border-slate-200 p-3 text-sm">
              <div className="font-semibold text-slate-800">{appt.doctorName}</div>
              <div className="text-xs text-slate-500">
                Nouveau RDV · {appt.slot}
              </div>
            </div>
          ))}
          {doctors.slice(0, 2).map((doctor) => (
            <div key={`doc-${doctor.id}`} className="rounded-xl border border-slate-200 p-3 text-sm">
              <div className="font-semibold text-slate-800">{doctor.name}</div>
              <div className="text-xs text-slate-500">
                Profil active · {doctor.specialty}
              </div>
            </div>
          ))}
          {!appointments.length && !doctors.length && (
            <p className="text-sm text-slate-500">Aucune activite recente.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
