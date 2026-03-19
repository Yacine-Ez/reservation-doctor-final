import { useEffect, useState } from "react";
import { createDoctor, deleteDoctor, getDoctors, updateDoctor } from "../../services/api";

const ONBOARDING_KEY_PREFIX = "reservation-doctor-onboarding-";

function useDoctorDashboardState(ownerKey) {
  const [myDoctorCard, setMyDoctorCard] = useState(null);
  const [activePanel, setActivePanel] = useState("profile");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    photo: "",
    specialty: "Dentiste",
    location: "",
    referralSource: "YouTube",
    plan: "Basic",
  });
  const [fileInputKey, setFileInputKey] = useState(0);
  const [saveStatus, setSaveStatus] = useState("");

  const onboardingKey = `${ONBOARDING_KEY_PREFIX}${ownerKey}`;
  const myDoctorCardId = myDoctorCard?.id || null;

  useEffect(() => {
    if (!ownerKey) {
      return;
    }

    getDoctors()
      .then((res) => {
        const mine = res.data.find((doc) => doc.ownerKey === ownerKey);
        if (!mine) {
          setMyDoctorCard(null);
          setShowOnboarding(true);
          return;
        }

        setMyDoctorCard(mine);
        setFormData({
          name: mine.name || "",
          photo: mine.photo || "",
          specialty: mine.specialty || "Dentiste",
          location: mine.location || "",
          referralSource: mine.referralSource || "YouTube",
          plan: mine.plan || "Basic",
        });

        const onboardingDone = localStorage.getItem(onboardingKey) === "1";
        setShowOnboarding(!onboardingDone);
      })
      .catch((err) => console.log(err));
  }, [ownerKey, onboardingKey]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSaveStatus("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSaveStatus("");
      setFormData((prev) => ({
        ...prev,
        photo: typeof reader.result === "string" ? reader.result : "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateOrUpdateDoctor = async () => {
    if (!ownerKey) {
      setSaveStatus("Session missing. Please login again.");
      return;
    }

    try {
      if (myDoctorCardId) {
        const res = await updateDoctor(myDoctorCardId, { ...formData, ownerKey });
        setMyDoctorCard(res.data);
        setSaveStatus("Card updated successfully.");
      } else {
        const res = await createDoctor({ ...formData, ownerKey });
        setMyDoctorCard(res.data);
        setSaveStatus("Card created successfully.");
      }

      localStorage.setItem(onboardingKey, "1");
      setShowOnboarding(false);
      setActivePanel("chat");
    } catch (error) {
      console.log(error);
      const apiMessage = error?.response?.data?.message;
      setSaveStatus(
        error?.response?.status === 409
          ? "You already have a card. You can only modify it."
          : apiMessage || "Operation failed. Please try again."
      );
    }
  };

  const isNextDisabled = (step) => {
    if (step === 1) return !formData.name.trim();
    if (step === 2) return !formData.photo;
    if (step === 3) return !formData.specialty.trim() || !formData.location.trim();
    if (step === 4) return !formData.referralSource;
    if (step === 5) return !formData.plan;
    return false;
  };

  const handleDeleteCard = async () => {
    if (!myDoctorCardId) {
      return;
    }

    try {
      await deleteDoctor(myDoctorCardId, ownerKey);
      setMyDoctorCard(null);
      setFormData({
        name: "",
        photo: "",
        specialty: "Dentiste",
        location: "",
        referralSource: "YouTube",
        plan: "Basic",
      });
      setFileInputKey((prev) => prev + 1);
      setShowOnboarding(true);
      setActivePanel("profile");
      setActiveStep(1);
      localStorage.removeItem(onboardingKey);
      setSaveStatus("Card deleted successfully.");
    } catch (error) {
      console.log(error);
      setSaveStatus("Failed to delete card.");
    }
  };

  const handleShowProfile = () => {
    setActivePanel("profile");
    setShowOnboarding(false);
  };

  const handleShowChat = () => {
    setActivePanel("chat");
    setShowOnboarding(false);
  };

  const handleShowAppointments = () => {
    setActivePanel("appointments");
    setShowOnboarding(false);
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
    setActivePanel("profile");
    setActiveStep(1);
  };

  const handleSelectReferralSource = (source) => {
    setSaveStatus("");
    setFormData((prev) => ({ ...prev, referralSource: source }));
  };

  const handleSelectPlan = (planId) => {
    setSaveStatus("");
    setFormData((prev) => ({ ...prev, plan: planId }));
  };

  return {
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
  };
}

export default useDoctorDashboardState;
