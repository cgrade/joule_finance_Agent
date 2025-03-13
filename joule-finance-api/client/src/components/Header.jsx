import { useState } from "react";
import { FiSettings } from "react-icons/fi";
import Settings from "./Settings";

function Header() {
  const [showSettings, setShowSettings] = useState(false);
  const [logo, setLogo] = useState(() => {
    return localStorage.getItem("joule_logo") || "";
  });

  // Listen for changes to the logo in localStorage
  window.addEventListener("storage", (e) => {
    if (e.key === "joule_logo") {
      setLogo(e.newValue);
    }
  });

  return (
    <>
      <header className="border-b border-neutral-200 bg-white py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 mb-2">
            {logo ? (
              <img
                src={logo}
                alt="Joule Finance Logo"
                className="w-10 h-10 rounded-lg object-contain"
              />
            ) : (
              <div className="bg-primary-600 text-white w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold">
                J
              </div>
            )}
            <h1 className="text-xl font-semibold text-neutral-900">
              Joule Finance Assistant
            </h1>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="text-neutral-500 hover:text-primary-600 transition-colors p-2 rounded-full hover:bg-neutral-100"
            aria-label="Settings"
          >
            <FiSettings size={20} />
          </button>
        </div>

        <p className="text-neutral-500 text-sm">
          Ask me anything about Joule Finance, DeFi, or blockchain technologies.
        </p>
      </header>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </>
  );
}

export default Header;
