# Semanas de mi vida

Visualizador de **la vida en semanas**: 80 filas (años) × 52 columnas (semanas).  
Cada círculo es una semana; la semana actual se resalta. La fecha de nacimiento se guarda **una sola vez** en `localStorage`.

https://github.com/<tu-usuario>/life-weeks (publica luego este repo)

---

## ✨ Características (Fase 1)

- Modal inicial para **fecha de nacimiento** (`dd/mm/aaaa`) con validación.
- La fecha se guarda en `localStorage` y **no se puede editar** desde la UI.
- Grilla **80 × 52** con **círculos**: pasado, actual y futuro.
- **Responsive**: en escritorio entran las 52 columnas sin scroll; en móvil se escalan.
- **Tema claro/oscuro** con botón **sol/luna** (persistido en `localStorage`).
- Leyenda y barra de resumen (semanas vividas, restantes, % y edad exacta).
- Estilos con **CSS Modules** + variables CSS (sin Tailwind).
- Preparado para impresión (estilos `@media print`).

---

## 🧰 Stack

- **React + TypeScript** (Vite)
- **CSS Modules** + variables CSS
- **date-fns** para utilidades de fecha
- **ESLint + Prettier**
- **localStorage** para persistencia (DOB y tema)

---

## 🚀 Empezar (WSL2 + VS Code)

Requisitos: **Node 18+ (recomendado 20+)** y **npm**.

```bash
# clona el repo
git clone git@github.com:<tu-usuario>/life-weeks.git
cd life-weeks

# instala dependencias
npm install

# desarrollo
npm run dev
# life-weeks
