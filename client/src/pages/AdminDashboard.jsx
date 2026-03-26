import { useEffect, useState } from "react";
import { getAppointments, getDoctors, getPatients } from "../services/api";

function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    getDoctors().then((res) => setDoctors(res.data || []));
    getPatients().then((res) => setPatients(res.data || []));
    getAppointments().then((res) => setAppointments(res.data || []));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-slate-500">Vue globale des utilisateurs et RDV.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-400">Doctors</p>
          <p className="text-2xl font-semibold text-slate-900">{doctors.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-400">Patients</p>
          <p className="text-2xl font-semibold text-slate-900">{patients.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-400">RDV</p>
          <p className="text-2xl font-semibold text-slate-900">{appointments.length}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Derniers RDV</h2>
          <div className="mt-4 space-y-3">
            {appointments.slice(0, 8).map((appt) => (
              <div key={appt.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                <div className="font-semibold">{appt.doctorName}</div>
                <div className="text-xs text-slate-500">{appt.specialty}</div>
                <div className="mt-1 text-xs text-slate-600">{appt.slot}</div>
                <div className="text-xs text-slate-500">
                  {appt.paymentMethod || "cash"} {appt.paymentStatus ? `(${appt.paymentStatus})` : ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Derniers patients</h2>
          <div className="mt-4 space-y-3">
            {patients.slice(0, 8).map((patient) => (
              <div key={patient.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                <div className="font-semibold">{patient.name}</div>
                <div className="text-xs text-slate-500">{patient.email}</div>
                <div className="text-xs text-slate-500">{patient.location || "-"}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
