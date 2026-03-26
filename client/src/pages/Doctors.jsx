import { useEffect, useState } from "react";
import { Skeleton } from "@mantine/core";
import { Bell, Bot, Calendar, Home, MessageCircle, User } from "lucide-react";
import {
  createAppointment,
  createChat,
  getAppointments,
  getAppointmentsForPatient,
  getChats,
  getDoctors,
  sendChatMessage,
  updateAppointment,
  getPatientProfile,
  upsertPatientProfile,
} from "../services/api";
import Navbar from "../components/Navbar";
import DoctorCard from "../components/DoctorCard";
import AiTriagePanel from "../components/AiTriagePanel";

function DoctorsView({ onLogout }) {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [recommendedIds, setRecommendedIds] = useState([]);
  const [aiNote, setAiNote] = useState("");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [activeView, setActiveView] = useState("doctors");
  const [chatThreads, setChatThreads] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [patientProfile, setPatientProfile] = useState(null);
  const [profileDraft, setProfileDraft] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    allergies: "",
    chronicConditions: "",
    medications: "",
    notes: "",
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadThreads, setUnreadThreads] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const activeChat = chatThreads.find((thread) => thread.id === activeChatId);
  const patientLocation = patientProfile?.location?.trim() || "";

  const openChatForDoctor = async (doctor) => {
    if (!doctor) return;
    const thread = chatThreads.find(
      (item) => Number(item.doctorId) === Number(doctor.id) || item.name === doctor.name
    );
    if (thread) {
      setActiveChatId(thread.id);
    } else {
      const created = await createChat({
        doctorId: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
      });
      setChatThreads((prev) => [...prev, created.data]);
      setActiveChatId(created.data.id);
    }
    setActiveView("chat");
  };

  const saveProfile = async () => {
    const next = {
      firstName: profileDraft.firstName.trim(),
      lastName: profileDraft.lastName.trim(),
      email: profileDraft.email.trim(),
      phone: profileDraft.phone.trim(),
      location: profileDraft.location.trim(),
      allergies: profileDraft.allergies.trim(),
      chronicConditions: profileDraft.chronicConditions.trim(),
      medications: profileDraft.medications.trim(),
      notes: profileDraft.notes.trim(),
    };
    if (!next.firstName || !next.lastName || !next.location || !next.email) return;
    localStorage.setItem("reservation-patient-profile", JSON.stringify(next));
    localStorage.setItem(
      "reservation-patient-name",
      `${next.firstName} ${next.lastName}`.trim()
    );
    setPatientProfile(next);
    const patientKey = localStorage.getItem("reservation-patient-key");
    if (patientKey) {
      await upsertPatientProfile({
        patientKey,
        name: `${next.firstName} ${next.lastName}`.trim(),
        email: next.email,
        phone: next.phone,
        location: next.location,
        allergies: next.allergies,
        chronicConditions: next.chronicConditions,
        medications: next.medications,
        notes: next.notes,
      });
    }
    setActiveView("doctors");
  };

  useEffect(() => {
    let timer;
    setLoadingDoctors(true);
    getDoctors()
      .then((res) => {
        setDoctors(res.data);
        setFiltered(res.data);
      })
      .catch(() => null)
      .finally(() => {
        timer = setTimeout(() => setLoadingDoctors(false), 2000);
      });
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setActiveView("doctors");
    let patientKey = localStorage.getItem("reservation-patient-key");
    if (!patientKey) {
      patientKey = `patient-${Date.now()}`;
      localStorage.setItem("reservation-patient-key", patientKey);
    }

    getPatientProfile(patientKey)
      .then((res) => {
        if (res.data) {
          const fullName = res.data.name || "";
          const [firstName, ...rest] = fullName.split(" ");
          const fromServer = {
            firstName: firstName || "",
            lastName: rest.join(" "),
            email: res.data.email || "",
            phone: res.data.phone || "",
            location: res.data.location || "",
            allergies: res.data.allergies || "",
            chronicConditions: res.data.chronicConditions || "",
            medications: res.data.medications || "",
            notes: res.data.notes || "",
          };
          setPatientProfile(fromServer);
          setProfileDraft(fromServer);
          localStorage.setItem("reservation-patient-profile", JSON.stringify(fromServer));
        }
      })
      .catch(() => null);

    const storedProfile = localStorage.getItem("reservation-patient-profile");
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        setPatientProfile(parsed);
        setProfileDraft(parsed);
      } catch {
        setPatientProfile(null);
      }
    }
    let chatsTimer;
    let appointmentsTimer;
    setLoadingChats(true);
    setLoadingAppointments(true);
    getChats()
      .then((res) => {
        setChatThreads(res.data);
        if (res.data.length) {
          setActiveChatId(res.data[0].id);
        }
      })
      .catch(() => null)
      .finally(() => {
        chatsTimer = setTimeout(() => setLoadingChats(false), 2000);
      });
    getAppointmentsForPatient(patientKey)
      .then((res) => setAppointments(res.data))
      .catch(() => null)
      .finally(() => {
        appointmentsTimer = setTimeout(() => setLoadingAppointments(false), 2000);
      });

    const storedNotifs = localStorage.getItem("reservation-notifications");
    if (storedNotifs) {
      try {
        setNotifications(JSON.parse(storedNotifs));
      } catch {
        setNotifications([]);
      }
    }
    return () => {
      clearTimeout(chatsTimer);
      clearTimeout(appointmentsTimer);
    };
  }, []);

  useEffect(() => {
    if (!patientLocation) {
      setFiltered(doctors);
    } else {
      const sorted = [...doctors].sort((a, b) => {
        const aInCity = a.location?.toLowerCase().includes(patientLocation.toLowerCase());
        const bInCity = b.location?.toLowerCase().includes(patientLocation.toLowerCase());
        if (aInCity === bInCity) return 0;
        return aInCity ? -1 : 1;
      });
      setFiltered(sorted);
    }
  }, [doctors, patientLocation]);

  useEffect(() => {
    const poll = setInterval(() => {
      getChats().then((res) => setChatThreads(res.data || []));
    }, 15000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    const unread = [];
    let total = 0;
    const nextNotifications = [...notifications];
    const existingKeys = new Set(
      nextNotifications.map((item) => `${item.threadId}:${item.index}`)
    );

    chatThreads.forEach((thread) => {
      const lastRead = Number(localStorage.getItem(`reservation-chat-read-${thread.id}`) || 0);
      const messages = thread.messages || [];
      const unreadMessages = messages.slice(lastRead);
      const unreadDoctorMessages = unreadMessages
        .map((msg, idx) => ({ msg, index: lastRead + idx }))
        .filter((item) => item.msg.from === "doctor");
      if (unreadDoctorMessages.length > 0) {
        unread.push(thread);
        total += unreadDoctorMessages.length;

        unreadDoctorMessages.forEach((item) => {
          const key = `${thread.id}:${item.index}`;
          if (!existingKeys.has(key)) {
            nextNotifications.unshift({
              id: key,
              threadId: thread.id,
              doctorName: thread.name,
              text: item.msg.text,
              index: item.index,
              createdAt: Date.now(),
              read: false,
            });
            existingKeys.add(key);
          }
        });
      }
    });
    if (nextNotifications.length !== notifications.length) {
      setNotifications(nextNotifications);
      localStorage.setItem("reservation-notifications", JSON.stringify(nextNotifications));
    }
    setUnreadCount(total);
    setUnreadThreads(unread);
  }, [chatThreads, notifications]);

  useEffect(() => {
    if (activeView !== "chat" || !activeChat) return;
    const count = activeChat.messages?.length || 0;
    localStorage.setItem(`reservation-chat-read-${activeChat.id}`, String(count));
    setUnreadThreads((prev) => prev.filter((thread) => thread.id !== activeChat.id));
    const updated = notifications.map((item) =>
      item.threadId === activeChat.id ? { ...item, read: true } : item
    );
    setNotifications(updated);
    localStorage.setItem("reservation-notifications", JSON.stringify(updated));
  }, [activeView, activeChat?.id, activeChat?.messages?.length]);

  const handleSearch = (value) => {
    const query = value.toLowerCase().trim();
    if (!query) {
      setFiltered(doctors);
      setRecommendedIds([]);
      setAiNote("");
      return;
    }

    const result = doctors.filter((doc) => {
      const nameOk = doc.name?.toLowerCase().includes(query);
      const specialtyOk = doc.specialty?.toLowerCase().includes(query);
      const priceOk = String(doc.priceValue || "").includes(query);
      return nameOk || specialtyOk || priceOk;
    });

    if (patientLocation) {
      const sorted = [...result].sort((a, b) => {
        const aInCity = a.location?.toLowerCase().includes(patientLocation.toLowerCase());
        const bInCity = b.location?.toLowerCase().includes(patientLocation.toLowerCase());
        if (aInCity === bInCity) return 0;
        return aInCity ? -1 : 1;
      });
      setFiltered(sorted);
    } else {
      setFiltered(result);
    }

    setRecommendedIds([]);
    setAiNote("");
  };

  const handleAiResult = ({ recommendedIds: nextRecommendedIds, filters, why, done }) => {
    const hasRecommendations = nextRecommendedIds.length > 0;
    const nextFiltered = hasRecommendations
      ? doctors.filter((doc) => nextRecommendedIds.includes(doc.id))
      : doctors.filter((doc) => {
          const matchSpecialty = filters?.specialty
            ? doc.specialty.toLowerCase().includes(filters.specialty.toLowerCase())
            : true;
          const matchLocation = filters?.location
            ? doc.location.toLowerCase().includes(filters.location.toLowerCase())
            : true;
          return matchSpecialty && matchLocation;
        });

    setFiltered(nextFiltered.length ? nextFiltered : doctors);
    setRecommendedIds(hasRecommendations ? nextRecommendedIds : []);
    setAiNote(why || "");
    // Stay in AI chat; user can switch views manually.
  };

  const getMeetingLink = (appointment) =>
    `https://meet.jit.si/ReservationDoctor-${appointment.id}`;

  const handlePrintMedicalRecord = () => {
    if (!patientProfile) return;
    const win = window.open("", "_blank", "width=800,height=1000");
    if (!win) return;
    const now = new Date().toLocaleString("fr-FR");
    win.document.write(`
      <html>
        <head>
          <title>Dossier medical</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
            h1 { font-size: 20px; margin-bottom: 12px; }
            .row { margin: 6px 0; }
            .label { font-weight: 700; }
            .muted { color: #64748b; font-size: 12px; margin-top: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Dossier medical</h1>
            <div class="row"><span class="label">Nom:</span> ${patientProfile.firstName} ${patientProfile.lastName}</div>
            <div class="row"><span class="label">Email:</span> ${patientProfile.email || "-"}</div>
            <div class="row"><span class="label">Telephone:</span> ${patientProfile.phone || "-"}</div>
            <div class="row"><span class="label">Ville:</span> ${patientProfile.location || "-"}</div>
            <div class="row"><span class="label">Allergies:</span> ${patientProfile.allergies || "-"}</div>
            <div class="row"><span class="label">Maladies chroniques:</span> ${patientProfile.chronicConditions || "-"}</div>
            <div class="row"><span class="label">Medicaments:</span> ${patientProfile.medications || "-"}</div>
            <div class="row"><span class="label">Notes:</span> ${patientProfile.notes || "-"}</div>
            <div class="muted">Genere le ${now}</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleExportAppointments = () => {
    if (!appointments.length) return;
    const headers = ["ID", "Medecin", "Specialite", "Creneau", "Statut", "Paiement"];
    const rows = appointments.map((appt) => [
      appt.id,
      appt.doctorName,
      appt.specialty,
      appt.slot,
      appt.status || "",
      `${appt.paymentMethod || ""} ${appt.paymentStatus || ""}`.trim(),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "historique-rdv.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar
        onSearch={handleSearch}
        actionLabel="Logout"
        onActionClick={onLogout}
      />

      <div className="px-4 sm:px-6 pt-32 sm:pt-36 pb-10">
        <h1 className="text-3xl font-bold text-slate-900">Find Your Doctor</h1>
        <p className="mt-2 text-sm text-slate-500">
          L&apos;assistant IA peut filtrer les cartes selon vos besoins.
        </p>
      </div>

      <div className="flex flex-col gap-6 px-4 sm:px-6 pb-10 md:flex-row">
        <aside
          className={`flex w-full items-center gap-4 overflow-x-auto rounded-3xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm transition-all md:w-auto md:flex-col md:items-center md:gap-5 md:py-6 ${
            isSidebarExpanded ? "md:w-52" : "md:w-[72px]"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsSidebarExpanded((prev) => !prev)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-semibold text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
            aria-label="Basculer la barre laterale"
          >
            {isSidebarExpanded ? "<" : ">"}
          </button>

          <button
            type="button"
            onClick={() => setActiveView("doctors")}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-slate-600 transition ${
              activeView === "doctors"
                ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "border-slate-200 bg-white hover:border-slate-900 hover:text-slate-900"
            }`}
            aria-label="Home"
          >
            <Home size={20} />
          </button>
          {isSidebarExpanded && (
            <span className="hidden text-xs font-semibold text-slate-500 md:block">Home</span>
          )}

          <button
            type="button"
            onClick={() => setActiveView("appointments")}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-slate-600 transition ${
              activeView === "appointments"
                ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "border-slate-200 bg-white hover:border-slate-900 hover:text-slate-900"
            }`}
            aria-label="My Appointments"
          >
            <Calendar size={20} />
          </button>
          {isSidebarExpanded && (
            <span className="hidden text-xs font-semibold text-slate-500 md:block">
              My Appointments
            </span>
          )}

          <button
            type="button"
            onClick={() => setActiveView("ai")}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-slate-600 transition ${
              activeView === "ai"
                ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "border-slate-200 bg-white hover:border-slate-900 hover:text-slate-900"
            }`}
            aria-label="AI"
          >
            <Bot size={20} />
          </button>
          {isSidebarExpanded && (
            <span className="hidden text-xs font-semibold text-slate-500 md:block">AI</span>
          )}

          <button
            type="button"
            onClick={() => setActiveView("chat")}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-slate-600 transition ${
              activeView === "chat"
                ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "border-slate-200 bg-white hover:border-slate-900 hover:text-slate-900"
            }`}
            aria-label="Chat"
          >
            <MessageCircle size={20} />
          </button>
          {isSidebarExpanded && (
            <span className="hidden text-xs font-semibold text-slate-500 md:block">Chat</span>
          )}

          <button
            type="button"
            onClick={() => setActiveView("notifications")}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-slate-600 transition ${
              activeView === "notifications"
                ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "border-slate-200 bg-white hover:border-slate-900 hover:text-slate-900"
            }`}
            aria-label="Notifications"
          >
            <div className="relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>
          {isSidebarExpanded && (
            <span className="hidden text-xs font-semibold text-slate-500 md:block">
              Notifications
            </span>
          )}

          <button
            type="button"
            onClick={() => setActiveView("profile")}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-slate-600 transition ${
              activeView === "profile"
                ? "border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                : "border-slate-200 bg-white hover:border-slate-900 hover:text-slate-900"
            }`}
            aria-label="Profile"
          >
            <User size={20} />
          </button>
          {isSidebarExpanded && (
            <span className="hidden text-xs font-semibold text-slate-500 md:block">Profile</span>
          )}
        </aside>

        <section className="min-w-0 flex-1 space-y-6">
          {!patientProfile && activeView !== "profile" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">
                Completez votre profil patient
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Ajoutez votre nom et votre ville pour voir les medecins proches.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Prenom"
                  value={profileDraft.firstName}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={profileDraft.lastName}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={profileDraft.email}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="text"
                  placeholder="Telephone"
                  value={profileDraft.phone}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="text"
                  placeholder="Ville"
                  value={profileDraft.location}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({ ...prev, location: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 md:col-span-2"
                />
              </div>
              <button
                type="button"
                onClick={saveProfile}
                className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Enregistrer
              </button>
            </div>
          )}

          {activeView === "profile" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Profil patient</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Prenom"
                  value={profileDraft.firstName}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="text"
                  placeholder="Nom"
                  value={profileDraft.lastName}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={profileDraft.email}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="text"
                  placeholder="Telephone"
                  value={profileDraft.phone}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  type="text"
                  placeholder="Ville"
                  value={profileDraft.location}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({ ...prev, location: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 md:col-span-2"
                />
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <textarea
                  placeholder="Allergies"
                  value={profileDraft.allergies}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({ ...prev, allergies: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 md:col-span-2"
                  rows={2}
                />
                <textarea
                  placeholder="Maladies chroniques"
                  value={profileDraft.chronicConditions}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({
                      ...prev,
                      chronicConditions: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 md:col-span-2"
                  rows={2}
                />
                <textarea
                  placeholder="Medicaments"
                  value={profileDraft.medications}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({ ...prev, medications: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 md:col-span-2"
                  rows={2}
                />
                <textarea
                  placeholder="Notes medicales"
                  value={profileDraft.notes}
                  onChange={(event) =>
                    setProfileDraft((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 md:col-span-2"
                  rows={3}
                />
              </div>
              <button
                type="button"
                onClick={saveProfile}
                className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Mettre a jour
              </button>
              <button
                type="button"
                onClick={handlePrintMedicalRecord}
                className="mt-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 hover:border-slate-900"
              >
                Imprimer dossier medical
              </button>
            </div>
          )}

          {activeView === "notifications" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Notifications</h2>
              {loadingChats ? (
                <div className="mt-4 space-y-3">
                  <Skeleton height={12} radius="xl" />
                  <Skeleton height={12} radius="xl" />
                  <Skeleton height={12} width="70%" radius="xl" />
                </div>
              ) : notifications.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  Aucune nouvelle notification pour le moment.
                </p>
              ) : (
                <div className="mt-6 space-y-3">
                  {notifications
                    .slice(0, 20)
                    .map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveChatId(item.threadId);
                        setActiveView("chat");
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 hover:border-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{item.doctorName}</div>
                        {!item.read && (
                          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{item.text}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeView === "ai" && (
            <div className="space-y-6">
              <AiTriagePanel doctors={doctors} onAiResult={handleAiResult} />
              <div className="space-y-4">
                {aiNote && (
                  <div className="rounded-2xl bg-white px-5 py-4 shadow-sm text-sm text-slate-600">
                    {aiNote}
                  </div>
                )}

                {loadingDoctors ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <div key={`doc-skeleton-ai-${idx}`} className="rounded-2xl bg-white p-5 shadow-sm">
                        <Skeleton height={64} circle mb="md" />
                        <Skeleton height={10} radius="xl" />
                        <Skeleton height={8} mt={6} radius="xl" />
                        <Skeleton height={8} mt={6} width="70%" radius="xl" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((doc) => (
                      <DoctorCard
                        key={doc.id}
                        doctor={doc}
                        isRecommended={recommendedIds.includes(doc.id)}
                        onChat={openChatForDoctor}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === "chat" && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)]">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Conversations</h2>
                <div className="mt-4 space-y-3">
                  {loadingChats ? (
                    <>
                      <Skeleton height={52} radius="xl" />
                      <Skeleton height={52} radius="xl" />
                      <Skeleton height={52} radius="xl" />
                    </>
                  ) : (
                    chatThreads.map((thread) => (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => setActiveChatId(thread.id)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          activeChatId === thread.id
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-900"
                        }`}
                      >
                        <div className="text-sm font-semibold">{thread.name}</div>
                        <div className="text-xs opacity-80">{thread.specialty}</div>
                        <div className="mt-2 text-xs opacity-70">{thread.lastMessage}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4">
                {loadingChats || !activeChat ? (
                  <div className="space-y-4">
                    <Skeleton height={16} width="40%" radius="xl" />
                    <Skeleton height={12} radius="xl" />
                    <Skeleton height={12} radius="xl" />
                    <Skeleton height={180} radius="xl" />
                    <Skeleton height={44} radius="xl" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Discussion avec</p>
                        <h3 className="text-xl font-semibold text-slate-900">{activeChat.name}</h3>
                        <p className="text-xs text-slate-500">{activeChat.specialty}</p>
                      </div>
                      <button
                        type="button"
                        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                      >
                        Demander rendez-vous
                      </button>
                    </div>

                    <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-3 max-h-[420px] overflow-y-auto">
                      {activeChat.messages.map((msg, idx) => (
                        <div
                          key={`${activeChat.id}-${idx}`}
                          className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                            msg.from === "doctor"
                              ? "bg-white text-slate-700 shadow"
                              : "ml-auto bg-slate-900 text-white"
                          }`}
                        >
                          {msg.text}
                        </div>
                      ))}

                      <div className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Rendez-vous disponibles
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {activeChat.slots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={async () => {
                                const appointment = await createAppointment({
                                  chatId: activeChat.id,
                                  doctorId: activeChat.doctorId || activeChat.id,
                                  slot,
                                });
                                setAppointments((prev) => [...prev, appointment.data]);
                                const updated = await sendChatMessage(activeChat.id, {
                                  from: "patient",
                                  text: `Je reserve le creneau ${slot}.`,
                                });
                                setChatThreads((prev) =>
                                  prev.map((thread) =>
                                    thread.id === updated.data.id ? updated.data : thread
                                  )
                                );
                              }}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-900 hover:text-slate-900"
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Ecrire un message..."
                        value={chatInput}
                        onChange={(event) => setChatInput(event.target.value)}
                        className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!chatInput.trim()) return;
                          const updated = await sendChatMessage(activeChat.id, {
                            from: "patient",
                            text: chatInput.trim(),
                          });
                          setChatThreads((prev) =>
                            prev.map((thread) =>
                              thread.id === updated.data.id ? updated.data : thread
                            )
                          );
                          setChatInput("");
                        }}
                        className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                      >
                        Envoyer
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeView === "appointments" && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-900">Mes rendez-vous</h2>
                <button
                  type="button"
                  onClick={handleExportAppointments}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:border-slate-900"
                >
                  Export historique
                </button>
              </div>
              {loadingAppointments ? (
                <div className="mt-4 space-y-3">
                  <Skeleton height={48} radius="xl" />
                  <Skeleton height={48} radius="xl" />
                </div>
              ) : appointments.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  Aucune reservation pour le moment. Choisissez un creneau via le chat.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {appointments.map((appt) => (
                    <div
                      key={appt.id}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
                    >
                      <div className="font-semibold">{appt.doctorName}</div>
                      <div className="text-xs text-slate-500">{appt.specialty}</div>
                      <div className="mt-2 text-xs text-slate-600">{appt.slot}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        Paiement: {appt.paymentMethod || "cash"}{" "}
                        {appt.paymentStatus ? `(${appt.paymentStatus})` : ""}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await updateAppointment(appt.id, { status: "cancelled" });
                            setAppointments((prev) =>
                              prev.map((item) =>
                                item.id === appt.id ? { ...item, status: "cancelled" } : item
                              )
                            );
                          }}
                          className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:border-rose-400"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const nextDate = window.prompt("Nouvelle date (YYYY-MM-DD):", "");
                            const nextTime = window.prompt("Nouvel horaire (HH:MM):", "");
                            if (!nextDate || !nextTime) return;
                            const nextSlot = `${nextDate} ${nextTime}`;
                            try {
                              await updateAppointment(appt.id, { slot: nextSlot, status: "pending" });
                              setAppointments((prev) =>
                                prev.map((item) =>
                                  item.id === appt.id ? { ...item, slot: nextSlot } : item
                                )
                              );
                            } catch (err) {
                              window.alert(
                                err?.response?.status === 409
                                  ? "Ce creneau est deja reserve."
                                  : "Erreur de reprogrammation."
                              );
                            }
                          }}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-900"
                        >
                          Reprogrammer
                        </button>
                        {appt.status && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                            {appt.status}
                          </span>
                        )}
                        <a
                          href={getMeetingLink(appt)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-900"
                        >
                          Video call
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            const win = window.open("", "_blank", "width=720,height=900");
                            if (!win) return;
                            const now = new Date().toLocaleString("fr-FR");
                            const paymentLabel = appt.paymentMethod || "cash";
                            win.document.write(`
                              <html>
                                <head>
                                  <title>Recu rendez-vous</title>
                                  <style>
                                    body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
                                    .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
                                    h1 { font-size: 20px; margin-bottom: 12px; }
                                    .row { margin: 6px 0; }
                                    .label { font-weight: 700; }
                                    .muted { color: #64748b; font-size: 12px; margin-top: 12px; }
                                    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; background: #e2e8f0; font-size: 12px; }
                                  </style>
                                </head>
                                <body>
                                  <div class="card">
                                    <h1>Recu de rendez-vous</h1>
                                    <div class="row"><span class="label">ID:</span> ${appt.id}</div>
                                    <div class="row"><span class="label">Medecin:</span> ${appt.doctorName}</div>
                                    <div class="row"><span class="label">Specialite:</span> ${appt.specialty}</div>
                                    <div class="row"><span class="label">Creneau:</span> ${appt.slot}</div>
                                    <div class="row"><span class="label">Paiement:</span> ${paymentLabel} ${appt.paymentStatus ? `(${appt.paymentStatus})` : ""}</div>
                                    <div class="row"><span class="label">Statut:</span> <span class="badge">${appt.status || "pending"}</span></div>
                                    <div class="muted">Genere le ${now}</div>
                                  </div>
                                  <script>window.print();</script>
                                </body>
                              </html>
                            `);
                            win.document.close();
                          }}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-900"
                        >
                          Imprimer recu
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === "doctors" && (
            <div className="space-y-4">
              {aiNote && (
                <div className="rounded-2xl bg-white px-5 py-4 shadow-sm text-sm text-slate-600">
                  {aiNote}
                </div>
              )}

              {patientLocation && (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                  Medecins disponibles a: <span className="font-semibold">{patientLocation}</span>
                </div>
              )}

              {loadingDoctors ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div key={`doc-skeleton-${idx}`} className="rounded-2xl bg-white p-5 shadow-sm">
                      <Skeleton height={64} circle mb="md" />
                      <Skeleton height={10} radius="xl" />
                      <Skeleton height={8} mt={6} radius="xl" />
                      <Skeleton height={8} mt={6} width="70%" radius="xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((doc) => (
                    <DoctorCard
                      key={doc.id}
                      doctor={doc}
                      isRecommended={recommendedIds.includes(doc.id)}
                      onChat={openChatForDoctor}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function DoctorsLocal() {
  const handleLogout = () => {
    localStorage.removeItem("reservation-auth");
    localStorage.removeItem("reservation-role");
    window.location.href = "/";
  };

  return <DoctorsView onLogout={handleLogout} />;
}

function Doctors() {
  return <DoctorsLocal />;
}

export default Doctors;
