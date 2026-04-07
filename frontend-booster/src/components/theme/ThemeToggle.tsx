import { motion, AnimatePresence } from "framer-motion";
import { SunIcon, MoonIcon } from "lucide-react";
import { Theme } from "../../hooks/useTheme";
interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === "dark";
  return (
    <button
      onClick={onToggle}
      className="p-2 text-theme-text-secondary hover:text-theme-text-primary transition-colors relative flex items-center justify-center rounded-full hover:bg-theme-surface"
      aria-label={`Mudar para tema ${isDark ? "claro" : "escuro"}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{
            opacity: 0,
            rotate: -90,
            scale: 0.5,
          }}
          animate={{
            opacity: 1,
            rotate: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            rotate: 90,
            scale: 0.5,
          }}
          transition={{
            duration: 0.2,
          }}
        >
          {isDark ? (
            <SunIcon className="w-5 h-5" />
          ) : (
            <MoonIcon className="w-5 h-5" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
