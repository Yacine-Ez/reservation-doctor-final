import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const savedRole = localStorage.getItem("reservation-role");
    if (savedRole) setRole(savedRole);
  }, []);

  const handleRoleSelect = (selectedRole) => {
    localStorage.setItem("reservation-role", selectedRole);
    setRole(selectedRole);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const fullName = form.fullName.trim();
    const email = form.email.trim();
    if (!role) {
      setError("Choisis un role pour continuer.");
      return;
    }
    if (!fullName || !email) {
      setError("Entre ton nom complet et ton email.");
      return;
    }
    localStorage.setItem("reservation-auth", "1");
    localStorage.setItem(
      "reservation-user",
      JSON.stringify({ fullName, email, role })
    );
    navigate(role === "doctor" ? "/doctor" : "/doctors", { replace: true });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6">
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

            {!role && (
              <p className="mt-4 text-sm text-slate-400">
                Selectionne un role pour afficher le formulaire de login.
              </p>
            )}

            {error && <p className="mt-4 text-sm font-medium text-red-300">{error}</p>}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-8 w-fit rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              Back to home
            </button>
          </section>

          <section className="flex items-center justify-center border-t border-slate-800 bg-slate-950/40 p-6 md:border-l md:border-t-0">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-700 bg-slate-900/70 p-8 text-left text-sm text-slate-200"
            >
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="Ex: Yacine Ez"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
              >
                Continuer
              </button>
              {!role && (
                <p className="text-xs text-slate-400">Selectionne un role a gauche.</p>
              )}
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Login;
