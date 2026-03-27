import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  confirmCheckoutSession,
  createAppointment,
  createChat,
  createCheckoutSession,
  getDoctorAvailability,
  getDoctorById,
} from "../services/api";

function DoctorDetails() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availability, setAvailability] = useState([]);
  const [bookingStatus, setBookingStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  useEffect(() => {
    getDoctorById(id)
      .then((res) => setDoctor(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  useEffect(() => {
    if (!date || !id) return;
    getDoctorAvailability(id, date)
      .then((res) => {
        setAvailability(res.data.available || []);
        setTime("");
      })
      .catch(() => setAvailability([]));
  }, [date, id]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const appointmentId = params.get("appointmentId");
    const sessionId = params.get("session_id");
    if (payment === "success" && appointmentId && sessionId) {
      confirmCheckoutSession({ appointmentId, sessionId })
        .then(() => setBookingStatus("Paiement confirme. Rendez-vous valide."))
        .catch(() => setBookingStatus("Paiement non confirme."));
    }
  }, []);

  if (!doctor) return <p className="p-6">Loading...</p>;

  const ratingValue = doctor.rating || 0;
  const experienceLabel =
    doctor.experienceYears !== null && doctor.experienceYears !== undefined
      ? `${doctor.experienceYears} ans d'experience`
      : "Experience non renseignee";
  const priceLabel = doctor.priceLabel || (doctor.priceValue ? `${doctor.priceValue} MAD` : null);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 max-w-2xl w-full">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          <img
            src={doctor.photo}
            alt={doctor.name}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold">{doctor.name}</h2>
            <p className="text-gray-500">{doctor.specialty}</p>
            <div className="mt-1 flex items-center gap-2 text-yellow-500">
              <span>{"★".repeat(Math.round(ratingValue)).padEnd(5, "☆")}</span>
              <span className="text-xs text-gray-400">{ratingValue.toFixed(1)}</span>
            </div>
            <p className="text-gray-400 mt-1"> {doctor.location}</p>
            <p className="text-gray-400 text-sm">{experienceLabel}</p>
            {priceLabel && <p className="text-gray-400 text-sm">Prix: {priceLabel}</p>}
          </div>
        </div>

        <p className="mt-6 text-gray-600">{doctor.description}</p>

        <div className="flex gap-4 mt-6">
          <button className="flex items-center gap-2 border px-4 py-2 rounded-lg">
            <MessageCircle size={18} />
            Chat
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <h3 className="text-lg font-semibold text-slate-900">Book a visit</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600"
            />
            <select
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600"
              disabled={!availability.length}
            >
              <option value="">Choisir un horaire</option>
              {availability.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600"
            >
              <option value="cash">Cash</option>
              <option value="wallet">Wallet</option>
              <option value="card">Carte bancaire</option>
            </select>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (!date || !time || !doctor) {
                setBookingStatus("Choisissez une date et un horaire.");
                return;
              }
              setBookingStatus("");
              try {
                const slot = `${date} ${time}`;
                const chatRes = await createChat({
                  doctorId: doctor.id,
                  name: doctor.name,
                  specialty: doctor.specialty,
                });

                if (paymentMethod === "card") {
                  const session = await createCheckoutSession({
                    doctorId: doctor.id,
                    slot,
                    chatId: chatRes.data.id,
                    patientKey: localStorage.getItem("reservation-patient-key"),
                  });
                  if (session.data?.url) {
                    window.location.href = session.data.url;
                    return;
                  }
                }

                await createAppointment({
                  chatId: chatRes.data.id,
                  doctorId: doctor.id,
                  slot,
                  paymentMethod,
                  patientKey: localStorage.getItem("reservation-patient-key"),
                  patientName: `${localStorage.getItem("reservation-patient-name") || ""}`.trim(),
                });
                setBookingStatus("Rendez-vous cree avec succes.");
              } catch (err) {
                setBookingStatus(
                  err?.response?.status === 409
                    ? "Ce creneau est deja reserve."
                    : "Erreur lors de la reservation."
                );
              }
            }}
            className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
          >
            Reserver
          </button>
          {bookingStatus && <p className="mt-3 text-sm text-slate-600">{bookingStatus}</p>}
        </div>
      </div>
    </div>
  );
}

export default DoctorDetails;
