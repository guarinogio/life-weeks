import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ThemeTransition({
  theme,
}: {
  theme: "light" | "dark";
}) {
  const [prevTheme, setPrevTheme] = useState(theme);
  const reduced = useReducedMotion();

  // Detectar cambios de tema
  useEffect(() => {
    if (theme !== prevTheme) {
      setPrevTheme(theme);
    }
  }, [theme, prevTheme]);

  return (
    <AnimatePresence>
      {/* Overlay que aparece solo en el frame del cambio */}
      <motion.div
        key={theme}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.4 }}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          backgroundColor: theme === "dark" ? "#000" : "#fff",
          zIndex: 999,
        }}
      />
    </AnimatePresence>
  );
}
