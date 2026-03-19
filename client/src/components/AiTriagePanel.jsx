import { useEffect, useState } from "react";
import { triageWithAi } from "../services/api";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";

const initialAssistantMessage = {
  role: "assistant",
  content:
    "Bonjour, je vais vous aider a trouver un medecin. Decrivez votre probleme principal en une phrase.",
};

const quickSuggestions = [
  "J'ai mal aux dents depuis 3 jours.",
  "J'ai des douleurs thoraciques apres l'effort.",
  "J'ai des demangeaisons et des taches sur la peau.",
  "Je cherche un cardiologue a Casablanca.",
  "J'ai mal au dos depuis une semaine.",
];

const placeholders = [
  "J'ai mal aux dents depuis 3 jours.",
  "Je cherche un cardiologue a Casablanca.",
  "J'ai des demangeaisons depuis 5 jours.",
  "J'ai des douleurs thoraciques apres l'effort.",
  "Je veux un dermatologue proche de moi.",
];

function normalizeFilters(filters) {
  return {
    specialty: filters?.specialty || null,
    location: filters?.location || null,
  };
}

function AiTriagePanel({ doctors, onAiResult }) {
  const [messages, setMessages] = useState([initialAssistantMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMessages([initialAssistantMessage]);
  }, [doctors.length]);

  const handleSend = async (overrideText) => {
    const baseText = typeof overrideText === "string" ? overrideText : input;
    const nextText = baseText.trim();
    if (!nextText || isLoading) return;

    const userMessage = { role: "user", content: nextText };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const response = await triageWithAi({
        messages: nextMessages.map((msg) => ({ role: msg.role, content: msg.content })),
        doctors,
      });

      const data = response.data || {};
      const assistantMessage = {
        role: "assistant",
        content: data.assistant_message || "Pouvez-vous preciser ?",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (typeof onAiResult === "function") {
        onAiResult({
          done: Boolean(data.done),
          recommendedIds: Array.isArray(data.recommended_doctor_ids)
            ? data.recommended_doctor_ids
            : [],
          filters: normalizeFilters(data.filters),
          why: data.why || "",
        });
      }
    } catch (err) {
      setError("Une erreur est survenue. Verifiez votre cle API et reessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-3xl bg-white shadow-lg p-6 flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Assistant IA</p>
        <p className="text-sm text-slate-500">
          Pas de diagnostic medical. L&apos;assistant pose quelques questions puis propose le
          medecin le plus adapte.
        </p>
      </header>

      <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-4 max-h-[420px] overflow-y-auto">
        {messages.map((msg, index) => (
          <div
            key={`${msg.role}-${index}`}
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "assistant"
                ? "bg-white shadow text-slate-700"
                : "bg-slate-900 text-white ml-auto"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="rounded-2xl px-4 py-3 text-sm text-slate-500 bg-white shadow">
            L&apos;assistant prepare la prochaine question...
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 text-rose-700 px-4 py-2 text-sm">{error}</div>
      )}

      <div className="flex flex-wrap gap-2">
        {quickSuggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => handleSend(suggestion)}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="pt-2">
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={(event) => setInput(event.target.value)}
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        />
      </div>
    </section>
  );
}

export default AiTriagePanel;
