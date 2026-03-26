import Stepper, { Step } from "../Stepper";
import { premiumPlans, referralSources, specialties } from "./constants";

function DoctorOnboardingFlow({
  activeStep,
  fileInputKey,
  formData,
  myDoctorCardId,
  onStepChange,
  onFinalStepCompleted,
  onInputChange,
  onPhotoChange,
  onSelectReferralSource,
  onSelectPlan,
  isNextDisabled,
}) {
  return (
    <Stepper
      initialStep={1}
      onStepChange={onStepChange}
      onFinalStepCompleted={onFinalStepCompleted}
      backButtonText="Previous"
      nextButtonText="Next"
      finalButtonText={myDoctorCardId ? "Modify" : "Submit"}
      isNextDisabled={isNextDisabled(activeStep)}
      className="max-w-2xl"
      contentMinHeightClass="min-h-[180px]"
    >
      <Step>
        <h2 className="text-xl font-bold text-slate-900">Step 1: Nom</h2>
        <p className="mt-2 text-sm text-slate-500">Comment voulez-vous apparaitre pour les patients?</p>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
          placeholder="Dr Ahmed"
        />
      </Step>

      <Step>
        <h2 className="text-xl font-bold text-slate-900">Step 2: Image</h2>
        <p className="mt-2 text-sm text-slate-500">Ajoutez une photo claire de profil.</p>
        <input
          key={fileInputKey}
          type="file"
          accept="image/*"
          onChange={onPhotoChange}
          className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
        />
        {formData.photo && (
          <img src={formData.photo} alt="Preview" className="mt-4 h-36 w-full rounded-xl object-cover" />
        )}
      </Step>

      <Step>
        <h2 className="text-xl font-bold text-slate-900">Step 3: Specialite + Ville</h2>
        <p className="mt-2 text-sm text-slate-500">Choisissez votre domaine et votre ville.</p>
        <div className="mt-4 space-y-3">
          <select
            name="specialty"
            value={formData.specialty}
            onChange={onInputChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
          >
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={onInputChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
            placeholder="Casablanca, Morocco"
          />
          <input
            type="number"
            name="experienceYears"
            min="0"
            value={formData.experienceYears}
            onChange={onInputChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-cyan-500"
            placeholder="Experience (annees)"
          />
        </div>
      </Step>

      <Step>
        <h2 className="text-xl font-bold text-slate-900">Step 4: YouTube ou Insta?</h2>
        <p className="mt-2 text-sm text-slate-500">Dites-nous ou vous avez entendu parler de nous.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {referralSources.map((source) => (
            <button
              key={source}
              type="button"
              onClick={() => onSelectReferralSource(source)}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                formData.referralSource === source
                  ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                  : "border-slate-300 text-slate-700"
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </Step>

      <Step>
        <h2 className="text-xl font-bold text-slate-900">Step 5: Premium Cards</h2>
        <p className="mt-2 text-sm text-slate-500">Choisissez le plan de votre carte.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {premiumPlans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => onSelectPlan(plan.id)}
              className={`rounded-2xl border p-3 text-left transition ${
                formData.plan === plan.id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-300 bg-white"
              }`}
            >
              <p className="font-semibold text-slate-900">{plan.title}</p>
              <p className="mt-1 text-xs text-slate-500">{plan.subtitle}</p>
            </button>
          ))}
        </div>
      </Step>

      <Step>
        <h2 className="text-xl font-bold text-slate-900">Final Review</h2>
        <p className="mt-2 text-sm text-slate-500">Verifiez vos infos avant publier.</p>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p>
            <span className="font-semibold">Nom:</span> {formData.name}
          </p>
          <p>
            <span className="font-semibold">Specialite:</span> {formData.specialty}
          </p>
          <p>
            <span className="font-semibold">Ville:</span> {formData.location}
          </p>
          <p>
            <span className="font-semibold">Experience:</span>{" "}
            {formData.experienceYears ? `${formData.experienceYears} ans` : "-"}
          </p>
          <p>
            <span className="font-semibold">Source:</span> {formData.referralSource}
          </p>
          <p>
            <span className="font-semibold">Plan:</span> {formData.plan}
          </p>
        </div>
      </Step>
    </Stepper>
  );
}

export default DoctorOnboardingFlow;
