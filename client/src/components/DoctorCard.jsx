import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

function DoctorCard({ doctor, isRecommended = false, onChat }) {
  const ratingValue = doctor.rating || 0;
  const experienceLabel =
    doctor.experienceYears !== null && doctor.experienceYears !== undefined
      ? `${doctor.experienceYears} ans d'experience`
      : null;
  const priceLabel = doctor.priceLabel || (doctor.priceValue ? `${doctor.priceValue} MAD` : null);
  const mapQuery = doctor.location ? encodeURIComponent(doctor.location) : "";
  const mapUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
    : null;

  return (
    <div
      className={`bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition ${
        isRecommended ? "ring-2 ring-slate-900/80" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <img
          src={doctor.photo}
          alt={doctor.name}
          className="w-16 h-16 rounded-full object-cover"
        />

        <div>
          <h3 className="text-lg font-bold">{doctor.name}</h3>
          <p className="text-gray-500">{doctor.specialty}</p>

          <div className="flex items-center gap-2 text-yellow-500">
            <span>{"★".repeat(Math.round(ratingValue)).padEnd(5, "☆")}</span>
            <span className="text-xs text-gray-400">{ratingValue.toFixed(1)}</span>
          </div>

          <p className="text-sm text-gray-400"> {doctor.location}</p>
          {experienceLabel && <p className="text-xs text-gray-400">{experienceLabel}</p>}
          {priceLabel && <p className="text-xs text-gray-400">Prix: {priceLabel}</p>}
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-600 hover:text-cyan-700"
            >
              Voir sur Google Maps
            </a>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-4">
        <Link
          to={`/doctor/${doctor.id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          View Profile
        </Link>

        <button
          type="button"
          onClick={() => onChat?.(doctor)}
          className="flex items-center gap-2 border px-3 py-2 rounded-lg"
        >
          <MessageCircle size={18} />
          Chat
        </button>
      </div>
    </div>
  );
}

export default DoctorCard;
