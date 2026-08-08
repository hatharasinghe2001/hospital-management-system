import { useTheme } from "../context/ThemeContext";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle">
      <h2>Appearance</h2>
      <p>Choose how the dashboard looks on this device.</p>

      <div className="theme-toggle__options">
        <button
          type="button"
          className={
            theme === "light" ? "theme-toggle__option theme-toggle__option--active" : "theme-toggle__option"
          }
          onClick={() => setTheme("light")}
        >
          <span aria-hidden="true">☀️</span> Light
        </button>
        <button
          type="button"
          className={
            theme === "dark" ? "theme-toggle__option theme-toggle__option--active" : "theme-toggle__option"
          }
          onClick={() => setTheme("dark")}
        >
          <span aria-hidden="true">🌙</span> Dark
        </button>
      </div>
    </div>
  );
}
