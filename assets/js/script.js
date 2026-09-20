/* ---------- tab switching ---------- */
const tabBtns = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

function activateTab(name) {
  tabBtns.forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  tabPanels.forEach((p) => p.classList.toggle("active", p.id === `tab-${name}`));
  document.querySelector(".main").scrollTo?.({ top: 0 });
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  history.replaceState(null, "", `#${name}`);
}

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => activateTab(btn.dataset.tab));
});

const initial = (location.hash || "").replace("#", "");
if (["overview", "experience", "skills", "projects", "contact"].includes(initial)) {
  activateTab(initial);
}

/* ---------- sidebar skills -> jump to Skills tab ---------- */
document.querySelectorAll("[data-tab-jump]").forEach((btn) => {
  btn.addEventListener("click", () => activateTab(btn.dataset.tabJump));
});

/* ---------- contact reveal ---------- */
const contactToggleBtn = document.getElementById("contactToggleBtn");
const contactReveal = document.getElementById("contactReveal");
contactToggleBtn.addEventListener("click", () => {
  contactReveal.classList.toggle("open");
});

/* ---------- stat bars (5-segment) ---------- */
document.querySelectorAll(".bar-track[data-level]").forEach((track) => {
  const level = parseInt(track.dataset.level, 10) || 0;
  for (let i = 1; i <= 5; i++) {
    const seg = document.createElement("span");
    seg.className = "seg" + (i <= level ? " on" : "");
    track.appendChild(seg);
  }
});

/* ---------- projects inventory grid ---------- */
const grid = document.getElementById("projectGrid");
const filterBar = document.getElementById("filterBar");
let activeFilter = "all";

function tierLabel(cat) {
  return cat === "unreal" ? "Unreal" : cat === "unity" ? "Unity" : "Other";
}
function tierClass(cat) {
  return cat === "unreal" ? "unreal" : cat === "unity" ? "unity" : "common";
}

function renderGrid() {
  const items = PROJECTS.filter((p) => activeFilter === "all" || p.category === activeFilter);
  grid.innerHTML = items
    .map(
      (p) => `
    <article class="inv-card tier-${tierClass(p.category)}" data-id="${p.id}" tabindex="0" role="button" aria-label="Open ${p.title} details">
      <div class="inv-thumb">
        <span class="rarity-tag ${tierClass(p.category)}">${tierLabel(p.category)}</span>
        <img src="${p.img}" alt="${p.title}" loading="lazy"
             onerror="this.closest('.inv-thumb').style.background='var(--panel-2)'; this.remove();">
      </div>
      <div class="inv-info">
        <h3>${p.title}</h3>
        <p>${p.catLabel || p.subtitle || ""}</p>
      </div>
    </article>`
    )
    .join("");

  grid.querySelectorAll(".inv-card").forEach((card) => {
    card.addEventListener("click", () => openModal(card.dataset.id));
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter") openModal(card.dataset.id);
    });
  });
}

filterBar.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderGrid();
  });
});

renderGrid();

/* ---------- modal ---------- */
const backdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalSub = document.getElementById("modalSub");
const modalMedia = document.getElementById("modalMedia");
const modalBullets = document.getElementById("modalBullets");
const modalLinks = document.getElementById("modalLinks");
const modalClose = document.getElementById("modalClose");

function openModal(id) {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return;

  modalTitle.textContent = p.title;
  modalSub.textContent = [tierLabel(p.category), p.subtitle].filter(Boolean).join(" — ");

  modalMedia.innerHTML = "";
  if (p.videos && p.videos.length) {
    const v = document.createElement("video");
    v.controls = true;
    v.src = p.videos[0];
    v.setAttribute("playsinline", "");
    modalMedia.appendChild(v);
  } else if (p.img) {
    const img = document.createElement("img");
    img.src = p.img;
    img.alt = p.title;
    modalMedia.appendChild(img);
  }

  modalBullets.innerHTML = (p.bullets || []).map((b) => `<li>${b}</li>`).join("");
  modalLinks.innerHTML = (p.links || [])
    .map((l) => `<a href="${l.href}" target="_blank" rel="noopener">${l.text} ↗</a>`)
    .join("");

  backdrop.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  backdrop.classList.remove("open");
  document.body.style.overflow = "";
  modalMedia.innerHTML = "";
}

modalClose.addEventListener("click", closeModal);
backdrop.addEventListener("click", (e) => {
  if (e.target === backdrop) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
