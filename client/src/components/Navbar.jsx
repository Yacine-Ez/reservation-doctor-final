import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PlaceholdersAndVanishInput } from "./ui/placeholders-and-vanish-input";

function Navbar({
  onSearch = () => {},
  showSearch = true,
  actionLabel,
  onActionClick,
  adminLabel,
  onAdminClick,
}) {
  const [search, setSearch] = useState("");
  const [logoSrc, setLogoSrc] = useState("/design-sans-titre.png");
  const searchRef = useRef("");
  const searchPlaceholders = [
    "Dermatologue a Casablanca",
    "Dentiste a Fes",
    "Cardiologue Rabat",
    "Ophtalmologue proche de moi",
  ];

  const handleSearch = (e) => {
    if (e?.preventDefault) e.preventDefault();
    const value = searchRef.current.trim();
    if (!value) return;
    onSearch(value);
    searchRef.current = "";
  };

  return (
    <header className="fixed left-1/2 top-6 z-30 w-[92%] max-w-6xl -translate-x-1/2">
      <div className="rounded-full border border-white/40 bg-white/20 px-4 py-3 shadow-lg backdrop-blur-md sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="Reservation Doctor logo"
              onError={() => setLogoSrc("/Design sans titre.png")}
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="text-sm font-semibold tracking-wide text-slate-800 sm:text-base">
              Reservation Doctor
            </span>
          </div>

          <div className="flex items-center gap-5 text-sm font-medium text-slate-700">
            <Link to="/" className="transition hover:text-slate-900">
              Home
            </Link>
            <Link to="/doctors" className="transition hover:text-slate-900">
              Doctors
            </Link>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            {showSearch && (
              <div className="w-full sm:w-72">
                <PlaceholdersAndVanishInput
                  placeholders={searchPlaceholders}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    searchRef.current = e.target.value;
                  }}
                  onSubmit={handleSearch}
                />
              </div>
            )}

            {adminLabel && (
              <button
                type="button"
                onClick={onAdminClick}
                className="rounded-xl border border-white/40 bg-white/20 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white/80"
              >
                {adminLabel}
              </button>
            )}

            {actionLabel && (
              <button
                type="button"
                onClick={onActionClick}
                className="rounded-xl border border-white/50 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                {actionLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
