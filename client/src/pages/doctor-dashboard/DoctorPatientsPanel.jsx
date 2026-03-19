import { useEffect, useState } from "react";
import { Skeleton } from "@mantine/core";
import { getChats, sendChatMessage, updateChatSlots } from "../../services/api";

function DoctorPatientsPanel({ myDoctorCard, loadingPatients }) {
  const [threads, setThreads] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState("");
  const [slotInput, setSlotInput] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);

  useEffect(() => {
    let threadsTimer;
    setLoadingThreads(true);
    getChats()
      .then((res) => {
        const all = res.data || [];
        const filtered = myDoctorCard
          ? all.filter(
              (thread) =>
                Number(thread.doctorId) === Number(myDoctorCard.id) ||
                thread.name?.toLowerCase() === myDoctorCard.name?.toLowerCase()
            )
          : all;
        setThreads(filtered);
        if (filtered.length) {
          setActiveChatId(filtered[0].id);
        }
      })
      .catch(() => null)
      .finally(() => {
        threadsTimer = setTimeout(() => setLoadingThreads(false), 2000);
      });
    return () => clearTimeout(threadsTimer);
  }, [myDoctorCard]);

  const activeThread = threads.find((thread) => thread.id === activeChatId);

  const handleSend = async () => {
    if (!activeThread || !input.trim()) return;
    const updated = await sendChatMessage(activeThread.id, {
      from: "doctor",
      text: input.trim(),
    });
    setThreads((prev) =>
      prev.map((thread) => (thread.id === updated.data.id ? updated.data : thread))
    );
    setInput("");
  };

  const handleAddSlot = async () => {
    if (!activeThread || !slotInput.trim()) return;
    const nextSlots = [...(activeThread.slots || []), slotInput.trim()];
    const updated = await updateChatSlots(activeThread.id, nextSlots);
    setThreads((prev) =>
      prev.map((thread) => (thread.id === updated.data.id ? updated.data : thread))
    );
    setSlotInput("");
  };

  const handleRemoveSlot = async (slot) => {
    if (!activeThread) return;
    const nextSlots = (activeThread.slots || []).filter((item) => item !== slot);
    const updated = await updateChatSlots(activeThread.id, nextSlots);
    setThreads((prev) =>
      prev.map((thread) => (thread.id === updated.data.id ? updated.data : thread))
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Conversations patients</h2>
        <div className="mt-4 space-y-3">
          {(loadingThreads || loadingPatients) && (
            <>
              <Skeleton height={52} radius="xl" />
              <Skeleton height={52} radius="xl" />
              <Skeleton height={52} radius="xl" />
            </>
          )}
          {!loadingThreads && threads.length === 0 && (
            <p className="text-sm text-slate-500">Aucune conversation pour le moment.</p>
          )}
          {!loadingThreads && threads.map((thread) => (
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
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4">
        {activeThread ? (
          <>
            <div>
              <p className="text-sm text-slate-500">Conversation avec</p>
              <h3 className="text-xl font-semibold text-slate-900">{activeThread.name}</h3>
              <p className="text-xs text-slate-500">{activeThread.specialty}</p>
            </div>

            <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-3 max-h-[420px] overflow-y-auto">
              {activeThread.messages.map((msg, idx) => (
                <div
                  key={`${activeThread.id}-${idx}`}
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.from === "doctor"
                      ? "ml-auto bg-slate-900 text-white"
                      : "bg-white text-slate-700 shadow"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ecrire un message..."
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <button
                type="button"
                onClick={handleSend}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Envoyer
              </button>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <h4 className="text-sm font-semibold text-slate-900">Disponibilites</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {(activeThread.slots || []).map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleRemoveSlot(slot)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:border-rose-500 hover:text-rose-600"
                  >
                    {slot} ✕
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="text"
                  value={slotInput}
                  onChange={(event) => setSlotInput(event.target.value)}
                  placeholder="Ex: Mardi 15:30"
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <button
                  type="button"
                  onClick={handleAddSlot}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">Choisissez une conversation.</p>
        )}
      </div>

    </div>
  );
}

export default DoctorPatientsPanel;
