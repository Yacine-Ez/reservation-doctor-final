const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { Agent } = require("undici");

const app = express();
const prisma = new PrismaClient();
app.get("/api", (req, res) => {
  res.json({ message: "API working ✅" });
});
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const openrouterAgent = new Agent({ connect: { family: 4 } });

const seedDoctors = [
  {
    name: "Dr Ahmed",
    specialty: "Cardiologue",
    rating: 4.5,
    location: "Fes, Morocco",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    description: "Expert in heart diseases with 10 years experience.",
  },
  {
    name: "Dr Sara",
    specialty: "Dentiste",
    rating: 4.0,
    location: "Casablanca, Morocco",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    description: "Specialist in dental care and orthodontics.",
  },
  {
    name: "Dr Youssef",
    specialty: "Dermatologue",
    rating: 5.0,
    location: "Rabat, Morocco",
    photo: "https://randomuser.me/api/portraits/men/54.jpg",
    description: "Dermatology expert, skin care consultant.",
  },
];

const seedPatients = [
  { name: "Amina El Idrissi", email: "amina@example.com" },
  { name: "Yassine Benali", email: "yassine@example.com" },
  { name: "Salma Ait", email: "salma@example.com" },
];

const seedChats = [
  {
    doctorId: 1,
    name: "Dr Ahmed",
    specialty: "Cardiologue",
    lastMessage: "Pouvez-vous preciser la douleur ?",
    messages: [
      { from: "doctor", text: "Bonjour, decrivez vos symptomes." },
      { from: "patient", text: "Douleurs thoraciques apres effort." },
      { from: "doctor", text: "Avez-vous des antecedents cardiaques ?" },
    ],
    slots: ["Aujourd'hui 16:00", "Demain 10:30", "Vendredi 14:00"],
  },
  {
    doctorId: 2,
    name: "Dr Sara",
    specialty: "Dentiste",
    lastMessage: "Je peux vous recevoir demain.",
    messages: [
      { from: "doctor", text: "Ou se situe la douleur ?" },
      { from: "patient", text: "Dent du fond, surtout la nuit." },
    ],
    slots: ["Demain 09:00", "Demain 11:30", "Samedi 15:00"],
  },
  {
    doctorId: 3,
    name: "Dr Youssef",
    specialty: "Dermatologue",
    lastMessage: "Avez-vous change de creme ?",
    messages: [
      { from: "doctor", text: "Depuis quand les demangeaisons ?" },
      { from: "patient", text: "Depuis 5 jours." },
    ],
    slots: ["Jeudi 12:00", "Jeudi 17:30", "Lundi 09:30"],
  },
];

async function ensureSeedData() {
  const doctorCount = await prisma.doctor.count();
  if (doctorCount === 0) {
    await prisma.doctor.createMany({ data: seedDoctors });
  }

  const patientCount = await prisma.patient.count();
  if (patientCount === 0) {
    await prisma.patient.createMany({ data: seedPatients });
  }

  const chatCount = await prisma.chatThread.count();
  if (chatCount === 0) {
    for (const chat of seedChats) {
      const thread = await prisma.chatThread.create({
        data: {
          doctorId: chat.doctorId,
          name: chat.name,
          specialty: chat.specialty,
          lastMessage: chat.lastMessage,
          slotsJson: JSON.stringify(chat.slots),
        },
      });
      if (chat.messages.length) {
        await prisma.chatMessage.createMany({
          data: chat.messages.map((msg) => ({
            chatId: thread.id,
            from: msg.from,
            text: msg.text,
          })),
        });
      }
    }
  }
}

app.get("/api/doctors", (req, res) => {
  prisma.doctor
    .findMany()
    .then((docs) => res.json(docs))
    .catch(() => res.status(500).json({ message: "server error" }));
});

app.get("/api/doctors/:id", (req, res) => {
  const id = Number(req.params.id);
  prisma.doctor
    .findUnique({ where: { id } })
    .then((doctor) => {
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      return res.send(doctor);
    })
    .catch(() => res.status(500).json({ message: "server error" }));
});

app.post("/api/doctors", (req, res) => {
  const { name, location, specialty, photo, ownerKey, referralSource, plan } = req.body;

  if (!name || !location || !specialty || !photo || !ownerKey) {
    return res
      .status(400)
      .json({ message: "name, location, specialty, photo and ownerKey are required" });
  }

  prisma.doctor
    .findFirst({ where: { ownerKey } })
    .then((existing) => {
      if (existing) {
        return res.status(409).json({ message: "Each doctor can only create one card" });
      }
      return prisma.doctor.create({
        data: {
          name,
          location,
          description: `${specialty} based in ${location}.`,
          specialty,
          rating: 4.0,
          photo,
          ownerKey,
          isCustom: true,
          referralSource: referralSource || "",
          plan: plan || "Basic",
          isPremium: plan === "Premium" || plan === "VIP",
        },
      });
    })
    .then((doctor) => {
      if (doctor) {
        res.status(201).json(doctor);
      }
    })
    .catch(() => res.status(500).json({ message: "server error" }));
});

app.put("/api/doctors/:id", (req, res) => {
  const id = Number(req.params.id);
  const { ownerKey } = req.body;

  prisma.doctor
    .findUnique({ where: { id } })
    .then((doctor) => {
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      if (doctor.ownerKey && doctor.ownerKey !== ownerKey) {
        return res.status(403).json({ message: "You can only modify your own card" });
      }
      return prisma.doctor.update({
        where: { id },
        data: { ...req.body, id },
      });
    })
    .then((updated) => {
      if (updated) {
        res.json(updated);
      }
    })
    .catch(() => res.status(500).json({ message: "server error" }));
});

app.delete("/api/doctors/:id", (req, res) => {
  const id = Number(req.params.id);
  const { ownerKey } = req.body;

  prisma.doctor
    .findUnique({ where: { id } })
    .then((doctor) => {
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      if (doctor.ownerKey && doctor.ownerKey !== ownerKey) {
        return res.status(403).json({ message: "You can only delete your own card" });
      }
      return prisma.doctor.delete({ where: { id } });
    })
    .then((deleted) => {
      if (deleted) {
        res.json({ message: "Doctor card deleted" });
      }
    })
    .catch(() => res.status(500).json({ message: "server error" }));
});

app.get("/api/patients", (req, res) => {
  prisma.patient
    .findMany()
    .then((list) => res.json(list))
    .catch(() => res.status(500).json({ message: "server error" }));
});

app.get("/api/chats", (req, res) => {
  prisma.chatThread
    .findMany({
      include: { messages: { orderBy: { createdAt: "asc" } } },
      orderBy: { updatedAt: "desc" },
    })
    .then((threads) => {
      const mapped = threads.map((thread) => ({
        id: thread.id,
        doctorId: thread.doctorId,
        name: thread.name,
        specialty: thread.specialty,
        lastMessage: thread.lastMessage,
        messages: thread.messages.map((msg) => ({ from: msg.from, text: msg.text })),
        slots: JSON.parse(thread.slotsJson || "[]"),
      }));
      res.json(mapped);
    })
    .catch(() => res.status(500).json({ message: "server error" }));
});

app.get("/api/chats/:id", (req, res) => {
  prisma.chatThread
    .findUnique({
      where: { id: Number(req.params.id) },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    })
    .then((thread) => {
      if (!thread) {
        return res.status(404).json({ message: "Chat not found" });
      }
      return res.json({
        id: thread.id,
        doctorId: thread.doctorId,
        name: thread.name,
        specialty: thread.specialty,
        lastMessage: thread.lastMessage,
        messages: thread.messages.map((msg) => ({ from: msg.from, text: msg.text })),
        slots: JSON.parse(thread.slotsJson || "[]"),
      });
    })
    .catch(() => res.status(500).json({ message: "server error" }));
});

app.post("/api/chats", (req, res) => {
  const { doctorId, name, specialty } = req.body || {};
  if (!doctorId || !name) {
    return res.status(400).json({ message: "doctorId and name are required" });
  }

  prisma.chatThread
    .findFirst({
      where: {
        OR: [{ doctorId: Number(doctorId) }, { name }],
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    })
    .then((existing) => {
      if (existing) {
        return res.json({
          id: existing.id,
          doctorId: existing.doctorId,
          name: existing.name,
          specialty: existing.specialty,
          lastMessage: existing.lastMessage,
          messages: existing.messages.map((msg) => ({ from: msg.from, text: msg.text })),
          slots: JSON.parse(existing.slotsJson || "[]"),
        });
      }

      return prisma.chatThread.create({
        data: {
          doctorId: Number(doctorId),
          name,
          specialty: specialty || "",
          lastMessage: "",
          slotsJson: JSON.stringify(["Demain 10:00", "Demain 15:00", "Vendredi 09:30"]),
        },
      });
    })
    .then((created) => {
      if (!created || created.messages) return;
      res.status(201).json({
        id: created.id,
        doctorId: created.doctorId,
        name: created.name,
        specialty: created.specialty,
        lastMessage: created.lastMessage,
        messages: [],
        slots: JSON.parse(created.slotsJson || "[]"),
      });
    })
    .catch(() => res.status(500).json({ message: "server error" }));
});

app.post("/api/chats/:id/messages", (req, res) => {
  const { text, from } = req.body || {};
  if (!text || !from) {
    return res.status(400).json({ message: "text and from are required" });
  }

  const chatId = Number(req.params.id);
  prisma.chatThread
    .findUnique({ where: { id: chatId } })
    .then((thread) => {
      if (!thread) {
        return res.status(404).json({ message: "Chat not found" });
      }
      return prisma.chatMessage.create({
        data: { chatId, from, text },
      });
    })
    .then(() =>
      prisma.chatThread.update({
        where: { id: chatId },
        data: { lastMessage: text },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      })
    )
    .then((updated) => {
      if (!updated) return;
      res.json({
        id: updated.id,
        doctorId: updated.doctorId,
        name: updated.name,
        specialty: updated.specialty,
        lastMessage: updated.lastMessage,
        messages: updated.messages.map((msg) => ({ from: msg.from, text: msg.text })),
        slots: JSON.parse(updated.slotsJson || "[]"),
      });
    })
    .catch(() => res.status(500).json({ message: "server error" }));
});

app.get("/api/appointments", (req, res) => {
  const doctorId = req.query.doctorId ? Number(req.query.doctorId) : null;
  prisma.appointment
    .findMany({
      where: doctorId ? { doctorId } : undefined,
      orderBy: { createdAt: "desc" },
    })
    .then((appointments) => res.json(appointments))
    .catch(() => res.status(500).json({ message: "server error" }));
});

app.post("/api/appointments", (req, res) => {
  const { chatId, doctorId, slot } = req.body || {};
  if (!chatId || !doctorId || !slot) {
    return res.status(400).json({ message: "chatId, doctorId and slot are required" });
  }

  prisma.doctor
    .findUnique({ where: { id: Number(doctorId) } })
    .then((doctor) => {
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      return prisma.appointment.create({
        data: {
          chatId: Number(chatId),
          doctorId: Number(doctorId),
          doctorName: doctor.name,
          specialty: doctor.specialty,
          slot,
          status: "pending",
        },
      });
    })
    .then((appointment) => {
      if (appointment) {
        res.status(201).json(appointment);
      }
    })
    .catch(() => res.status(500).json({ message: "server error" }));
});

app.put("/api/appointments/:id", (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ message: "status is required" });
  }
  prisma.appointment
    .update({ where: { id }, data: { status } })
    .then((updated) => res.json(updated))
    .catch(() => res.status(500).json({ message: "server error" }));
});

app.put("/api/chats/:id/slots", (req, res) => {
  const chatId = Number(req.params.id);
  const { slots } = req.body || {};
  if (!Array.isArray(slots)) {
    return res.status(400).json({ message: "slots must be an array" });
  }

  prisma.chatThread
    .update({
      where: { id: chatId },
      data: { slotsJson: JSON.stringify(slots) },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    })
    .then((updated) => {
      if (!updated) return;
      res.json({
        id: updated.id,
        doctorId: updated.doctorId,
        name: updated.name,
        specialty: updated.specialty,
        lastMessage: updated.lastMessage,
        messages: updated.messages.map((msg) => ({ from: msg.from, text: msg.text })),
        slots: JSON.parse(updated.slotsJson || "[]"),
      });
    })
    .catch(() => res.status(500).json({ message: "server error" }));
});

function formatDoctorsForPrompt(doctorsList) {
  return doctorsList
    .map((doc) => {
      return `- id: ${doc.id}\n  name: ${doc.name}\n  specialty: ${doc.specialty}\n  location: ${doc.location}\n  rating: ${doc.rating}\n  description: ${doc.description}`;
    })
    .join("\n");
}

function buildSystemPrompt(doctorsList) {
  return [
    "Tu es un assistant de triage pour aider un patient a trouver le meilleur medecin.",
    "Parle uniquement en francais.",
    "Ne donne pas de diagnostic ni de traitement. Reste sur le triage et l'orientation.",
    "Pose une seule question a la fois, et pas plus de 3 questions avant de proposer un medecin.",
    "Si l'utilisateur dit seulement bonjour/salut/cc ou reste vague, reponds poliment puis demande une precision claire (symptome, specialite, ville).",
    "Ne propose aucun medecin tant qu'il n'y a pas un besoin medical clair ou une specialite/ville.",
    "Quand tu as assez d'information, choisis 1 a 3 medecins parmi la liste fournie.",
    "Si la specialite ou la ville est claire, propose directement des medecins adaptes.",
    "Tu dois repondre en JSON valide uniquement, sans texte en dehors du JSON.",
    "Format JSON attendu:",
    '{ "assistant_message": "string", "done": boolean, "filters": { "specialty": "string|null", "location": "string|null" }, "recommended_doctor_ids": [number], "why": "string" }',
    "",
    "Liste des medecins:",
    formatDoctorsForPrompt(doctorsList),
  ].join("\n");
}

function guessFiltersFromText(text, doctorsList) {
  const lower = text.toLowerCase();
  let specialty = null;
  let location = null;

  for (const doc of doctorsList) {
    if (!specialty && doc.specialty && lower.includes(doc.specialty.toLowerCase())) {
      specialty = doc.specialty;
    }
    if (!location && doc.location && lower.includes(doc.location.toLowerCase())) {
      location = doc.location;
    }
  }

  return { specialty, location };
}

function fallbackRecommendations(doctorsList, filters) {
  const bySpecialty = filters.specialty
    ? doctorsList.filter((doc) =>
        doc.specialty.toLowerCase().includes(filters.specialty.toLowerCase())
      )
    : doctorsList;
  const byLocation = filters.location
    ? bySpecialty.filter((doc) =>
        doc.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    : bySpecialty;

  const pool = byLocation.length > 0 ? byLocation : bySpecialty;
  const sorted = [...pool].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  return sorted.slice(0, 3).map((doc) => doc.id);
}

app.post("/api/ai/triage", async (req, res) => {
  try {
    const { messages, doctors: doctorsList } = req.body || {};

    if (!Array.isArray(messages) || !Array.isArray(doctorsList)) {
      return res.status(400).json({ message: "messages and doctors are required" });
    }

    const lastUser = [...messages].reverse().find((msg) => msg.role === "user");
    const lastText = (lastUser?.content || "").trim();
    const guessed = guessFiltersFromText(lastText, doctorsList);
    const missingContext = !guessed.specialty && !guessed.location;

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ message: "OPENROUTER_API_KEY is missing" });
    }

    const systemPrompt = buildSystemPrompt(doctorsList);
    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "Reservation Doctor",
      },
      dispatcher: openrouterAgent,
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: chatMessages,
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const outputText = data?.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      parsed = JSON.parse(outputText);
    } catch (parseError) {
      parsed = null;
    }

    if (!parsed) {
      const fallbackIds = fallbackRecommendations(doctorsList, guessed);
      return res.json({
        assistant_message: "Voici des medecins proposes selon votre demande.",
        done: true,
        filters: guessed,
        recommended_doctor_ids: fallbackIds,
        why: "Proposition basee sur la specialite et la localisation indiquees.",
      });
    }

    const safeFilters = parsed.filters || { specialty: null, location: null };
    const safeIds = Array.isArray(parsed.recommended_doctor_ids)
      ? parsed.recommended_doctor_ids
      : [];

    if (safeIds.length === 0) {
      const mergedFilters = {
        specialty: safeFilters.specialty || guessed.specialty,
        location: safeFilters.location || guessed.location,
      };
      const fallbackIds = fallbackRecommendations(doctorsList, mergedFilters);
      parsed.recommended_doctor_ids = fallbackIds;
      parsed.filters = mergedFilters;
    }

    return res.json(parsed);
  } catch (error) {
    console.error("AI triage error:", error);
    return res.status(500).json({ message: "AI triage failed" });
  }
});

const PORT = process.env.PORT || 5000;
ensureSeedData()
  .then(() => {
    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });
  })
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exit(1);
  });
