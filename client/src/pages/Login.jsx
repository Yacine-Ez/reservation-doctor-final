import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignIn, SignUp, SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";

function Login() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [role, setRole] = useState("");
  const [authMode, setAuthMode] = useState("signIn");

  useEffect(() => {
    const savedRole = localStorage.getItem("reservation-role");
    if (savedRole) setRole(savedRole);
  }, []);

  const handleRoleSelect = (selectedRole) => {
    localStorage.setItem("reservation-role", selectedRole);
    setRole(selectedRole);
  };

  useEffect(() => {
    if (isSignedIn && role) {
      navigate(role === "doctor" ? "/doctor" : "/doctors", { replace: true });
    }
  }, [isSignedIn, role, navigate]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl backdrop-blur md:grid-cols-2">
          <section className="flex flex-col justify-center p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Reservation Doctor
            </p>
            <h1 className="mt-4 text-3xl font-bold text-white md:text-4xl">Login</h1>
            <p className="mt-3 text-sm text-slate-300">
              Choisis ton role puis connecte-toi avec ton compte.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleRoleSelect("patient")}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  role === "patient"
                    ? "bg-cyan-500 text-slate-950"
                    : "border border-slate-700 text-slate-100 hover:border-cyan-400"
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("doctor")}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  role === "doctor"
                    ? "bg-emerald-500 text-slate-950"
                    : "border border-slate-700 text-slate-100 hover:border-emerald-400"
                }`}
              >
                Doctor
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAuthMode("signIn")}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  authMode === "signIn"
                    ? "bg-white text-slate-950"
                    : "border border-slate-700 text-slate-200 hover:border-cyan-400"
                }`}
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("signUp")}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  authMode === "signUp"
                    ? "bg-cyan-500 text-slate-950"
                    : "border border-slate-700 text-slate-200 hover:border-cyan-400"
                }`}
              >
                Inscription
              </button>
            </div>

            {!role && (
              <p className="mt-4 text-sm text-slate-400">
                Selectionne un role pour afficher le formulaire de login.
              </p>
            )}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-8 w-fit rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Back to home
            </button>
          </section>

          <section className="flex items-center justify-center border-t border-slate-800 bg-slate-950/40 p-6 md:border-l md:border-t-0">
            <div className="w-full max-w-sm">
              <SignedOut>
                <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 sm:p-6">
                  {authMode === "signUp" ? (
                    <SignUp
                      routing="path"
                      path="/login"
                      appearance={{
                        variables: { colorPrimary: "#22d3ee" },
                        elements: {
                          card: "shadow-none bg-transparent border-0 p-0",
                          headerTitle: "text-white",
                          headerSubtitle: "text-slate-300",
                          socialButtonsBlockButton:
                            "border border-slate-700 text-slate-100 hover:border-cyan-400",
                          formButtonPrimary:
                            "bg-cyan-500 text-slate-950 hover:bg-cyan-400",
                        },
                      }}
                    />
                  ) : (
                    <SignIn
                      routing="path"
                      path="/login"
                      appearance={{
                        variables: { colorPrimary: "#22d3ee" },
                        elements: {
                          card: "shadow-none bg-transparent border-0 p-0",
                          headerTitle: "text-white",
                          headerSubtitle: "text-slate-300",
                          socialButtonsBlockButton:
                            "border border-slate-700 text-slate-100 hover:border-cyan-400",
                          formButtonPrimary:
                            "bg-cyan-500 text-slate-950 hover:bg-cyan-400",
                        },
                      }}
                    />
                  )}
                </div>
              </SignedOut>
              <SignedIn>
                <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 text-sm text-slate-200">
                  <p className="font-semibold text-white">Connexion reussie.</p>
                  {!role && (
                    <p className="mt-2 text-xs text-slate-400">
                      Choisis un role a gauche pour continuer.
                    </p>
                  )}
                </div>
              </SignedIn>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Login;
