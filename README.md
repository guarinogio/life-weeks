# Life Weeks

A minimalist **life-in-weeks** visualizer: **80 rows (years) × 52 columns (weeks)**.  
Each circle is one week; the **current week** is highlighted. Your date of birth is requested **once** and stored in `localStorage`.

---

## ✨ Features (Phase 1)

- One-time onboarding modal to enter **date of birth** (`dd/mm/yyyy`) with validation.
- DOB is saved in `localStorage` and **cannot be edited** from the UI.
- **80 × 52** **circular** grid (years in rows, weeks in columns): past, current, and future states.
- **Responsive**: on desktop all 52 columns fit without horizontal scroll; on mobile dots scale to fit.
- **Light/Dark theme** with a **sun/moon** toggle in the top-right corner (preference persisted in `localStorage`).
- Summary bar with **weeks lived / remaining / total (%)** and **exact age**.
- Styles via **CSS Modules** + CSS variables (no Tailwind).
- **Print-ready** styles.

---

## 🧰 Tech Stack

- **React + TypeScript** (Vite)
- **CSS Modules** + CSS custom properties (variables)
- **date-fns** for date utilities
- **ESLint + Prettier**
- **localStorage** for persistence (DOB and theme)

---

## 🚀 Getting Started (WSL2 + VS Code friendly)

**Requirements:** Node 18+ (20+ recommended) and npm.

```bash
# clone
git clone https://github.com/guarinogio/life-weeks.git
cd life-weeks

# install deps
npm install

# dev server
npm run dev
```

Open `http://localhost:5173`.  
On first load you'll see the **DOB modal** (`dd/mm/yyyy`). After confirming, the **80×52** grid renders with the **current week** highlighted.

> **Tip — Reset DOB:** Use the “Reset (hidden)” link at the footer, or run in DevTools:
> ```js
> localStorage.removeItem('lifeweeks.v1');
> ```

---

## 🌓 Theme (Light/Dark)

- Click the **sun/moon button** (top-right) to toggle light/dark.
- Preference is saved under `localStorage` key **`lifeweeks.theme`**.
- On load, the app applies the stored theme (or falls back to the OS preference).

---

## 📁 Project Structure

```
src/
  app/
    App.tsx
    App.module.css
  components/
    OnboardingModal/
      OnboardingModal.tsx
      OnboardingModal.module.css
    LifeGrid/
      LifeGrid.tsx
      LifeGrid.module.css
      WeekCell.tsx
      WeekCell.module.css
      YearLabel.tsx
      WeekHeader.tsx
    Legend.tsx
    Legend.module.css
    SummaryBar.tsx
    SummaryBar.module.css
    ThemeToggle.tsx
    ThemeToggle.module.css
  lib/
    storage.ts
    date.ts
    stats.ts
  styles/
    reset.css
    tokens.css
    globals.css
    print.css
  main.tsx
  vite-env.d.ts
index.html
```

---

## 🔧 Scripts

```bash
npm run dev       # development (Vite)
npm run build     # production build (dist/)
npm run preview   # serve the production build locally
```
