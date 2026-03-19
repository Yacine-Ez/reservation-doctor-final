import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAppointments } from "../services/api";
import DoctorDashboardHeader from "./doctor-dashboard/DoctorDashboardHeader";
import DoctorDashboardSidebar from "./doctor-dashboard/DoctorDashboardSidebar";
import DoctorOnboardingFlow from "./doctor-dashboard/DoctorOnboardingFlow";
import DoctorProfilePanel from "./doctor-dashboard/DoctorProfilePanel";
import DoctorPatientsPanel from "./doctor-dashboard/DoctorPatientsPanel";
import DoctorAppointmentsPanel from "./doctor-dashboard/DoctorAppointmentsPanel";
import useDoctorDashboardState from "./doctor-dashboard/useDoctorDashboardState";

function DoctorDashboardView({ onLogout, ownerKey }) {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const {
    myDoctorCard,
    activePanel,
    showOnboarding,
    activeStep,
    formData,
    fileInputKey,
    saveStatus,
    myDoctorCardId,
    setActiveStep,
    handleInputChange,
    handlePhotoChange,
    handleCreateOrUpdateDoctor,
    isNextDisabled,
    handleDeleteCard,
    handleShowProfile,
    handleShowChat,
    handleShowAppointments,
    handleShowOnboarding,
    handleSelectReferralSource,
    handleSelectPlan,
  } = useDoctorDashboardState(ownerKey);

  useEffect(() => {
    let patientsTimer;
    setLoadingPatients(true);
    axios
      .get("http://localhost:5000/api/patients")
      .then((res) => setPatients(res.data))
      .catch((err) => console.log(err))
      .finally(() => {
        patientsTimer = setTimeout(() => setLoadingPatients(false), 2000);
      });
    return () => clearTimeout(patientsTimer);
  }, []);

  useEffect(() => {
    if (!myDoctorCard?.id) {
      setAppointments([]);
      return;
    }
    let appointmentsTimer;
    setLoadingAppointments(true);
    getAppointments(myDoctorCard.id)
      .then((res) => setAppointments(res.data || []))
      .catch((err) => console.log(err))
      .finally(() => {
        appointmentsTimer = setTimeout(() => setLoadingAppointments(false), 2000);
      });
    return () => clearTimeout(appointmentsTimer);
  }, [myDoctorCard?.id]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-8">
        <DoctorDashboardHeader myDoctorCard={myDoctorCard} patientsCount={patients.length} />

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <DoctorDashboardSidebar
            myDoctorCard={myDoctorCard}
            myDoctorCardId={myDoctorCardId}
            appointments={appointments}
            loadingAppointments={loadingAppointments}
            onShowProfile={handleShowProfile}
            onShowChat={handleShowChat}
            onShowAppointments={handleShowAppointments}
            onShowOnboarding={handleShowOnboarding}
            onGoHome={() => navigate("/")}
            onLogout={onLogout}
          />

          <section>
            {showOnboarding ? (
              <DoctorOnboardingFlow
                activeStep={activeStep}
                fileInputKey={fileInputKey}
                formData={formData}
                myDoctorCardId={myDoctorCardId}
                onStepChange={setActiveStep}
                onFinalStepCompleted={handleCreateOrUpdateDoctor}
                onInputChange={handleInputChange}
                onPhotoChange={handlePhotoChange}
                onSelectReferralSource={handleSelectReferralSource}
                onSelectPlan={handleSelectPlan}
                isNextDisabled={isNextDisabled}
              />
            ) : (
              <div className="space-y-6">
                {activePanel === "profile" && (
                  <DoctorProfilePanel myDoctorCard={myDoctorCard} onDeleteCard={handleDeleteCard} />
                )}
                {activePanel === "chat" && (
                  <DoctorPatientsPanel
                    patients={patients}
                    myDoctorCard={myDoctorCard}
                    loadingPatients={loadingPatients}
                  />
                )}
                {activePanel === "appointments" && (
                  <DoctorAppointmentsPanel
                    appointments={appointments}
                    loadingAppointments={loadingAppointments}
                    onAppointmentsChange={setAppointments}
                  />
                )}
              </div>
            )}

            {saveStatus && <p className="mt-3 text-sm text-slate-600">{saveStatus}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}

function DoctorDashboardLocal() {
  const [ownerKey, setOwnerKey] = useState("");

  useEffect(() => {
    let localDoctorKey = localStorage.getItem("reservation-local-doctor-key");
    if (!localDoctorKey) {
      localDoctorKey = `local-doctor-${Date.now()}`;
      localStorage.setItem("reservation-local-doctor-key", localDoctorKey);
    }
    setOwnerKey(localDoctorKey);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("reservation-auth");
    localStorage.removeItem("reservation-role");
    window.location.href = "/";
  };

  if (!ownerKey) {
    return <p className="p-6 text-center text-slate-600">Loading...</p>;
  }

  return <DoctorDashboardView onLogout={handleLogout} ownerKey={ownerKey} />;
}

function DoctorDashboard() {
  return <DoctorDashboardLocal />;
}

export default DoctorDashboard;
