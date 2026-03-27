import { useNavigate } from "react-router-dom";
import { Facebook, Github, Instagram, Mail } from "lucide-react";
import Navbar from "../components/Navbar";
import TextType from "./TextType";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-cyan-950 to-slate-900">
      <Navbar
        showSearch={false}
        actionLabel="Login"
        onActionClick={() => navigate("/login")}
        adminLabel="Admin"
        onAdminClick={() => {
          localStorage.setItem("reservation-role", "admin");
          navigate("/admin");
        }}
      />
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 sm:px-6 pt-32 sm:pt-36 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Reservation Doctor
        </p>
        <h1 className="max-w-3xl text-3xl font-bold text-white sm:text-5xl">
          Bienvenue sur notre site pour reserver un rendez-vous medical
        </h1>
        <p className="mt-4 max-w-2xl text-lg font-medium text-cyan-300">
          <TextType
            text={["Text typing effect", "for your websites", "Happy coding!"]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor
            cursorCharacter="_"
            texts={[
              "Welcome to Reservation Doctor! Good to see you!",
              "Find the right specialist and book quickly!",
            ]}
            deletingSpeed={50}
            variableSpeedEnabled={false}
            variableSpeedMin={60}
            variableSpeedMax={120}
            cursorBlinkDuration={0.5}
          />
        </p>
        <p className="mt-4 max-w-2xl text-slate-200">
          Connectez-vous en tant que patient pour chercher un specialiste, ou en tant que doctor pour gerer vos patients.
        </p>
        <div className="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
          <button
            onClick={() => navigate("/login")}
            className="w-full rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 shadow-md shadow-cyan-500/40 transition hover:bg-cyan-400 sm:w-auto"
          >
            Commencer
          </button>
        </div>
      </div>

      <footer className="mt-16 border-t border-white/10 bg-slate-950/40 py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Reservation Doctor
            </p>
            <h3 className="mt-3 text-xl font-semibold text-white">Support & Contact</h3>
            <p className="mt-2 max-w-md text-sm text-slate-300">
              Une plateforme pour connecter patients et medecins, gerer les rendez-vous et
              lancer des consultations rapidement.
            </p>
            <p className="mt-4 text-sm text-slate-200">
              Email: <span className="font-semibold text-white">contact@reservation-doctor.com</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-200 hover:text-white"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
            <a
              href="mailto:contact@reservation-doctor.com"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-200 hover:text-white"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-200 hover:text-white"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-200 hover:text-white"
              aria-label="Facebook"
            >
              <Facebook size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
