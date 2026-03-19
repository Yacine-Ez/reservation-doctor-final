import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

function DoctorCard({ doctor, isRecommended = false, onChat }) {
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

          <div className="flex items-center text-yellow-500">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i}>{i < Math.floor(doctor.rating) ? "★" : "☆"}</span>
            ))}
          </div>

          <p className="text-sm text-gray-400"> {doctor.location}</p>
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
