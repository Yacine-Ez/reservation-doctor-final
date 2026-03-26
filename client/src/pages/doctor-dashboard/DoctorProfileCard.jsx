function DoctorProfileCard({ doctor, onDeleteCard }) {
  const ratingValue = doctor.rating || 0;
  const experienceLabel =
    doctor.experienceYears !== null && doctor.experienceYears !== undefined
      ? `${doctor.experienceYears} ans d'experience`
      : "Experience non renseignee";

  return (
    <div className="mt-4 grid gap-5 md:grid-cols-[220px_1fr]">
      <img src={doctor.photo} alt={doctor.name} className="h-48 w-full rounded-2xl object-cover" />
      <div>
        <p className="text-xl font-semibold text-slate-900">{doctor.name}</p>
        <p className="mt-1 text-slate-600">{doctor.specialty}</p>
        <p className="text-slate-600">{doctor.location}</p>
        <p className="mt-2 text-sm text-slate-500">{experienceLabel}</p>
        <div className="mt-2 flex items-center gap-2 text-sm text-amber-500">
          <span>{"★".repeat(Math.round(ratingValue)).padEnd(5, "☆")}</span>
          <span className="text-slate-500">{ratingValue.toFixed(1)}</span>
        </div>
        <p className="mt-3 text-sm text-slate-500">Source: {doctor.referralSource || "-"}</p>
        <p className="text-sm text-slate-500">Plan: {doctor.plan || "Basic"}</p>
        {doctor.isPremium && (
          <span className="mt-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Premium Card
          </span>
        )}
        <div className="mt-4">
          <button
            type="button"
            onClick={onDeleteCard}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete Card
          </button>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfileCard;
