import { useNavigate } from "react-router-dom";
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
    </div>
  );
}

export default Home;
