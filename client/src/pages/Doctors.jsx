import { useEffect, useState } from "react";
import { Skeleton } from "@mantine/core";
import { Bell, Bot, Calendar, Home, MessageCircle, User } from "lucide-react";
import {
  createAppointment,
  createChat,
  getAppointments,
  getChats,
  getDoctors,
  sendChatMessage,
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
  const [profileDraft, setProfileDraft] = useState({ firstName: "", lastName: "", location: "" });
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

  const saveProfile = () => {
    const next = {
      firstName: profileDraft.firstName.trim(),
      lastName: profileDraft.lastName.trim(),
      location: profileDraft.location.trim(),
    };
    if (!next.firstName || !next.lastName || !next.location) return;
    localStorage.setItem("reservation-patient-profile", JSON.stringify(next));
    setPatientProfile(next);
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
    getAppointments()
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
      return;
    }
    const sorted = [...doctors].sort((a, b) => {
      const aInCity = a.location?.toLowerCase().includes(patientLocation.toLowerCase());
      const bInCity = b.location?.toLowerCase().includes(patientLocation.toLowerCase());
      if (aInCity === bInCity) return 0;
      return aInCity ? -1 : 1;
    });
    setFiltered(sorted);
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
    const result = doctors.filter((doc) =>
      doc.specialty.toLowerCase().includes(value.toLowerCase())
    );
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

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar
        onSearch={handleSearch}
        actionLabel="Logout"
        onActionClick={onLogout}
      />

      <div className="px-6 pt-36 pb-10">
        <h1 className="text-3xl font-bold text-slate-900">Find Your Doctor</h1>
        <p className="mt-2 text-sm text-slate-500">
          L&apos;assistant IA peut filtrer les cartes selon vos besoins.
        </p>
      </div>

      <div className="flex gap-6 px-6 pb-10">
        <aside
          className={`flex flex-col items-center gap-5 rounded-3xl border border-slate-200 bg-white/80 py-6 shadow-sm transition-all ${
            isSidebarExpanded ? "w-52" : "w-[72px]"
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
            <span className="text-xs font-semibold text-slate-500">Home</span>
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
            <span className="text-xs font-semibold text-slate-500">My Appointments</span>
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
            <span className="text-xs font-semibold text-slate-500">AI</span>
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
          {isSidebarExpanded && <span className="text-xs font-semibold text-slate-500">Chat</span>}

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
            <span className="text-xs font-semibold text-slate-500">Notifications</span>
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
          {isSidebarExpanded && <span className="text-xs font-semibold text-slate-500">Profile</span>}
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
                Mettre a jour
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
              <h2 className="text-2xl font-semibold text-slate-900">Mes rendez-vous</h2>
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
