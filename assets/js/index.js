/* ==========================================================
   Personal Portfolio – index.js
   1) Active navbar link on scroll
   2) Dark / Light theme switch
   3) Portfolio filter tabs (no Bootstrap)
   4) Testimonials carousel
   5) Settings sidebar (fonts + theme colors)
   6) Scroll-to-top button
   ========================================================== */

const root = document.documentElement;
const body = document.body;

/* ---------- tiny localStorage helpers (never crash if blocked) ---------- */
const store = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

/* ==========================================================
   1) Active link in the navbar based on scroll position
   ========================================================== */
const navbar = document.getElementById("header");
const navLinks = document.querySelectorAll(".nav-links a[href^='#']");

// Pair every nav link with the section it points to
const navSections = [...navLinks]
  .map((link) => ({
    link,
    section: document.querySelector(link.getAttribute("href")),
  }))
  .filter((item) => item.section);

function updateActiveLink() {
  // a point a bit below the navbar: the section that contains it is "current"
  const checkpoint = window.scrollY + navbar.offsetHeight + 120;
  let current = navSections[0];

  navSections.forEach((item) => {
    if (item.section.offsetTop <= checkpoint) current = item;
  });

  // reached the very bottom of the page -> last link
  const atBottom =
    window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
  if (atBottom) current = navSections[navSections.length - 1];

  navSections.forEach(({ link }) => {
    const isActive = link === current.link;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

/* ==========================================================
   2) Dark / Light theme
   (dark mode = class "dark" on <html>, light mode = no class)
   ========================================================== */
const themeToggle = document.getElementById("theme-toggle-button");

function applyTheme(theme) {
  root.classList.toggle("dark", theme === "dark");
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
}

themeToggle.addEventListener("click", () => {
  const next = root.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
  store.set("theme", next);
});

applyTheme(store.get("theme") === "light" ? "light" : "dark");

/* ==========================================================
   3) Portfolio – filter tabs
   ========================================================== */
const filterButtons = document.querySelectorAll(".portfolio-filter");
const portfolioItems = document.querySelectorAll(".portfolio-item");

const ACTIVE_FILTER_CLASSES = [
  "bg-linear-to-r",
  "from-primary",
  "to-secondary",
  "text-white",
];
const INACTIVE_FILTER_CLASSES = [
  "bg-white",
  "dark:bg-slate-800",
  "text-slate-600",
  "dark:text-slate-300",
  "border",
  "border-slate-300",
  "dark:border-slate-700",
];

function setActiveFilter(button) {
  filterButtons.forEach((btn) => {
    const isActive = btn === button;
    btn.classList.toggle("active", isActive);
    btn.classList.remove(
      ...(isActive ? INACTIVE_FILTER_CLASSES : ACTIVE_FILTER_CLASSES),
    );
    btn.classList.add(
      ...(isActive ? ACTIVE_FILTER_CLASSES : INACTIVE_FILTER_CLASSES),
    );
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

function filterProjects(category) {
  portfolioItems.forEach((item) => {
    const match = category === "all" || item.dataset.category === category;

    if (match) {
      item.classList.remove("hidden");
      // let the browser paint it first, then fade it in
      requestAnimationFrame(() => {
        item.style.opacity = "1";
        item.style.transform = "scale(1)";
      });
    } else {
      item.style.opacity = "0";
      item.style.transform = "scale(0.95)";
      setTimeout(() => {
        // hide only if it still doesn't match (user may have clicked again)
        if (item.style.opacity === "0") item.classList.add("hidden");
      }, 300);
    }
  });
}

portfolioItems.forEach((item) => {
  item.style.transition = "opacity 300ms ease, transform 300ms ease";
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActiveFilter(button);
    filterProjects(button.dataset.filter);
  });
});

/* ==========================================================
   4) Testimonials carousel
   ========================================================== */
const track = document.getElementById("testimonials-carousel");
const cards = track.querySelectorAll(".testimonial-card");
const nextBtn = document.getElementById("next-testimonial");
const prevBtn = document.getElementById("prev-testimonial");
const dotsWrap = document.querySelector(".carousel-indicator").parentElement;
// reuse the markup classes of an inactive dot as a template
const dotClasses = document.querySelectorAll(".carousel-indicator")[1]
  .className;
const AUTOPLAY_DELAY = 5000;

let currentIndex = 0;
let autoplayId = null;

// The page is RTL, so the cards start from the right and "next" moves to the left
const direction = () => (getComputedStyle(root).direction === "rtl" ? 1 : -1);

// How many cards fit on screen (1 / 2 / 3 depending on the width)
const visibleCards = () =>
  Math.max(1, Math.round(track.offsetWidth / cards[0].offsetWidth));

// Last index we can slide to without leaving empty space
const maxIndex = () => Math.max(0, cards.length - visibleCards());

function goToSlide(index) {
  const last = maxIndex();
  // wrap around
  if (index > last) index = 0;
  if (index < 0) index = last;
  currentIndex = index;

  const offset = currentIndex * cards[0].offsetWidth * direction();
  track.style.transform = `translateX(${offset}px)`;
  updateIndicators();
}

// One dot per real slide position (changes with the number of visible cards)
function renderIndicators() {
  const count = maxIndex() + 1;
  if (dotsWrap.children.length === count) return;

  dotsWrap.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = dotClasses;
    dot.dataset.index = i;
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `التوصية ${i + 1}`);
    dotsWrap.appendChild(dot);
  }
}

function updateIndicators() {
  renderIndicators();
  [...dotsWrap.children].forEach((dot, i) => {
    const isActive = i === currentIndex;
    dot.setAttribute("aria-selected", String(isActive));
    dot.classList.toggle("bg-accent", isActive);
    dot.classList.toggle("bg-slate-400", !isActive);
    dot.classList.toggle("dark:bg-slate-600", !isActive);
    dot.style.width = isActive ? "2rem" : "";
  });
}

function startAutoplay() {
  stopAutoplay();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  autoplayId = setInterval(() => goToSlide(currentIndex + 1), AUTOPLAY_DELAY);
}

function stopAutoplay() {
  clearInterval(autoplayId);
  autoplayId = null;
}

nextBtn.addEventListener("click", () => {
  goToSlide(currentIndex + 1);
  startAutoplay();
});

prevBtn.addEventListener("click", () => {
  goToSlide(currentIndex - 1);
  startAutoplay();
});

dotsWrap.addEventListener("click", (e) => {
  const dot = e.target.closest("[data-index]");
  if (!dot) return;
  goToSlide(Number(dot.dataset.index));
  startAutoplay();
});

// pause while the user is hovering / focusing the carousel
const carouselArea = track.parentElement.parentElement;
carouselArea.addEventListener("mouseenter", stopAutoplay);
carouselArea.addEventListener("mouseleave", startAutoplay);
carouselArea.addEventListener("focusin", stopAutoplay);
carouselArea.addEventListener("focusout", startAutoplay);

// swipe support (mobile, where the arrow buttons are hidden)
let touchStartX = 0;
track.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoplay();
  },
  { passive: true },
);
track.addEventListener("touchend", (e) => {
  const diff = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(diff) > 50) {
    // swiping towards the right reveals the next card in RTL
    const goNext = diff * direction() > 0;
    goToSlide(currentIndex + (goNext ? 1 : -1));
  }
  startAutoplay();
});

// recalculate on resize (number of visible cards changes)
window.addEventListener("resize", () =>
  goToSlide(Math.min(currentIndex, maxIndex())),
);

// pause when the tab is hidden
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAutoplay();
  else startAutoplay();
});

goToSlide(0);
startAutoplay();

/* ==========================================================
   5) Settings sidebar – fonts & theme colors
   ========================================================== */
const settingsToggle = document.getElementById("settings-toggle");
const settingsSidebar = document.getElementById("settings-sidebar");
const closeSettings = document.getElementById("close-settings");
const resetSettings = document.getElementById("reset-settings");
const fontOptions = document.querySelectorAll(".font-option");
const colorsGrid = document.getElementById("theme-colors-grid");

/* ----- open / close ----- */
function openSettings() {
  settingsSidebar.classList.remove("translate-x-full");
  settingsSidebar.removeAttribute("inert");
  settingsSidebar.setAttribute("aria-hidden", "false");
  settingsToggle.setAttribute("aria-expanded", "true");
  // slide the gear along with the sidebar so it never covers its content
  settingsToggle.style.transform = "translate(-20rem, -50%)";
}

function closeSettingsPanel() {
  settingsSidebar.classList.add("translate-x-full");
  settingsSidebar.setAttribute("inert", "");
  settingsSidebar.setAttribute("aria-hidden", "true");
  settingsToggle.setAttribute("aria-expanded", "false");
  settingsToggle.style.transform = "translateY(-50%)";
}

const isSettingsOpen = () =>
  !settingsSidebar.classList.contains("translate-x-full");

settingsToggle.addEventListener("click", () => {
  isSettingsOpen() ? closeSettingsPanel() : openSettings();
});
closeSettings.addEventListener("click", closeSettingsPanel);

// click outside the sidebar closes it
document.addEventListener("click", (e) => {
  if (
    isSettingsOpen() &&
    !settingsSidebar.contains(e.target) &&
    !settingsToggle.contains(e.target)
  ) {
    closeSettingsPanel();
  }
});

// Esc closes it
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isSettingsOpen()) {
    closeSettingsPanel();
    settingsToggle.focus();
  }
});

closeSettingsPanel(); // start closed (also makes the hidden sidebar un-focusable)

/* ----- fonts ----- */
const DEFAULT_FONT = "tajawal";
const FONT_CLASSES = ["font-alexandria", "font-tajawal", "font-cairo"];

function applyFont(font) {
  body.classList.remove(...FONT_CLASSES);
  body.classList.add(`font-${font}`);

  fontOptions.forEach((option) => {
    const isActive = option.dataset.font === font;
    option.classList.toggle("active", isActive);
    option.setAttribute("aria-checked", String(isActive));
    option.style.borderColor = isActive ? "var(--color-primary)" : "";
  });
}

fontOptions.forEach((option) => {
  option.addEventListener("click", () => {
    applyFont(option.dataset.font);
    store.set("font", option.dataset.font);
  });
});

/* ----- theme colors ----- */
const colorPalettes = [
  { name: "نيلي", primary: "#6366f1", secondary: "#8b5cf6", accent: "#a855f7" },
  { name: "أزرق", primary: "#3b82f6", secondary: "#0ea5e9", accent: "#06b6d4" },
  { name: "أخضر", primary: "#10b981", secondary: "#14b8a6", accent: "#06b6d4" },
  { name: "وردي", primary: "#ec4899", secondary: "#f43f5e", accent: "#f97316" },
  {
    name: "برتقالي",
    primary: "#f97316",
    secondary: "#f59e0b",
    accent: "#ef4444",
  },
  {
    name: "بنفسجي",
    primary: "#8b5cf6",
    secondary: "#a855f7",
    accent: "#d946ef",
  },
  {
    name: "تركواز",
    primary: "#14b8a6",
    secondary: "#06b6d4",
    accent: "#3b82f6",
  },
  { name: "أحمر", primary: "#ef4444", secondary: "#f43f5e", accent: "#f59e0b" },
];
const DEFAULT_PALETTE = 0;

// build the color buttons
colorPalettes.forEach((palette, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.palette = index;
  button.setAttribute("role", "radio");
  button.setAttribute("aria-checked", "false");
  button.setAttribute("aria-label", `لون ${palette.name}`);
  button.title = palette.name;
  button.className = "flex items-center justify-center rounded-full";
  Object.assign(button.style, {
    width: "3rem",
    height: "3rem",
    background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
    border: "3px solid transparent",
    transition: "transform 200ms ease, box-shadow 200ms ease",
  });
  button.innerHTML =
    '<i class="fa-solid fa-check text-white" style="opacity:0;transition:opacity 200ms" aria-hidden="true"></i>';

  button.addEventListener(
    "mouseenter",
    () => (button.style.transform = "scale(1.1)"),
  );
  button.addEventListener("mouseleave", () => (button.style.transform = ""));
  button.addEventListener("click", () => {
    applyPalette(index);
    store.set("palette", index);
  });

  colorsGrid.appendChild(button);
});

function applyPalette(index) {
  const palette = colorPalettes[index];
  // inline CSS variables on <html> override the defaults used by Tailwind
  root.style.setProperty("--color-primary", palette.primary);
  root.style.setProperty("--color-secondary", palette.secondary);
  root.style.setProperty("--color-accent", palette.accent);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", palette.primary);

  colorsGrid.querySelectorAll("button").forEach((btn) => {
    const isActive = Number(btn.dataset.palette) === index;
    btn.setAttribute("aria-checked", String(isActive));
    btn.style.boxShadow = isActive ? `0 0 0 2px var(--color-primary)` : "";
    btn.style.borderColor = isActive ? "#fff" : "transparent";
    btn.firstElementChild.style.opacity = isActive ? "1" : "0";
  });
}

/* ----- reset ----- */
resetSettings.addEventListener("click", () => {
  ["theme", "font", "palette"].forEach(store.remove);
  applyTheme("dark");
  applyFont(DEFAULT_FONT);
  applyPalette(DEFAULT_PALETTE);
  // remove the inline overrides so the stylesheet defaults apply again
  ["--color-primary", "--color-secondary", "--color-accent"].forEach((v) =>
    root.style.removeProperty(v),
  );
});

/* ----- restore saved settings ----- */
applyFont(store.get("font") || DEFAULT_FONT);
const savedPalette = store.get("palette");
if (savedPalette !== null && colorPalettes[savedPalette]) {
  applyPalette(Number(savedPalette));
} else {
  // default look: just mark the first swatch as selected, no overrides
  applyPalette(DEFAULT_PALETTE);
  ["--color-primary", "--color-secondary", "--color-accent"].forEach((v) =>
    root.style.removeProperty(v),
  );
}

/* ==========================================================
   6) Scroll to top button
   ========================================================== */
const scrollTopBtn = document.getElementById("scroll-to-top");

function toggleScrollTop() {
  const show = window.scrollY > 400;
  scrollTopBtn.classList.toggle("opacity-0", !show);
  scrollTopBtn.classList.toggle("invisible", !show);
  scrollTopBtn.classList.toggle("opacity-100", show);
  scrollTopBtn.classList.toggle("visible", show);
}

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ==========================================================
   One scroll listener for everything that depends on scroll
   ========================================================== */
let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateActiveLink();
      toggleScrollTop();
      ticking = false;
    });
  },
  { passive: true },
);
window.addEventListener("resize", updateActiveLink);

// initial state on page load
updateActiveLink();
toggleScrollTop();
