const FEATURED_IDS = ["dynamiccamerasystem", "inputabilityqueuesystem", "aiattacktokensystem"];

const CASE_STUDIES = {
  dynamiccamerasystem: {
    kicker: "Unreal · Gameplay Architecture · Camera",
    summary: "A redesign of an existing RPG camera system, approached as a reusable gameplay system rather than a collection of one-off camera states.",
    facts: {
      "My ownership": "Took initiative on system design, gathered team input, documented the agreed architecture, decomposed the work, and implemented the solution.",
      "Design goal": "Keep camera behavior readable and extensible as gameplay states and modifiers grow.",
      "Approach": "Event-responsive camera states with additive profiles for effects such as zoom and sprint, blended smoothly between states.",
      "Senior signal": "Architecture ownership, stakeholder discussion, documentation, and end-to-end delivery."
    }
  },
  inputabilityqueuesystem: {
    kicker: "Unreal · GAS · Enhanced Input",
    summary: "A production input / ability queue that turns overlapping player inputs into deterministic, data-driven gameplay decisions.",
    facts: {
      "My ownership": "Designed and implemented the queue behavior and integration, including priority and cancellation rules.",
      "Constraints": "Not every input should be cacheable; locomotion and gameplay actions have different concerns; new input may supersede queued input.",
      "Approach": "Data-driven queue eligibility and priority, with separate locomotion and gameplay queues and explicit cancellation / replacement behavior.",
      "Senior signal": "Converted gameplay rules into a reusable policy-driven system instead of hard-coded feature logic."
    }
  },
  aiattacktokensystem: {
    kicker: "Unreal · AI · Combat Coordination",
    summary: "A smarter attack coordination model for an internal AI plugin, designed to control which enemies can commit to attacks and when.",
    facts: {
      "My ownership": "Owned the technical adaptation of the new attack behavior and its integration with the existing AI plugin.",
      "Problem": "Multiple enemies need coordinated attack opportunities without producing chaotic or unreadable combat.",
      "Approach": "Token-based attack coordination with context-aware decisions so attack permission is explicit and extensible.",
      "Senior signal": "Worked inside an existing framework while changing the behavior model instead of layering on isolated special cases."
    }
  }
};

function projectById(id) {
  return PROJECTS.find((project) => project.id === id);
}

function safeMedia(img, title, extraClass = "") {
  return `
    <div class="${extraClass}">
      <img src="${img}" alt="${title}" loading="lazy"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='grid'">
      <div class="media-fallback" style="display:none">${title}</div>
    </div>`;
}

function renderCaseStudies() {
  const grid = document.getElementById("caseStudyGrid");
  grid.innerHTML = FEATURED_IDS.map((id, index) => {
    const p = projectById(id);
    const c = CASE_STUDIES[id];
    if (!p || !c) return "";
    const facts = Object.entries(c.facts).slice(0, 2).map(([label, value]) => `
      <div class="case-fact"><span>${label}</span><span>${value}</span></div>`).join("");
    return `
      <article class="case-card reveal" data-id="${id}" tabindex="0" role="button" aria-label="Open ${p.title} case study">
        ${safeMedia(p.img, p.title, "case-media")}
        <span class="case-index">0${index + 1}</span>
        <div class="case-body">
          <span class="case-type">${c.kicker}</span>
          <h3>${p.title}</h3>
          <p>${c.summary}</p>
          <div class="case-facts">${facts}</div>
          <span class="case-open">Open case study →</span>
        </div>
      </article>`;
  }).join("");

  grid.querySelectorAll(".case-card").forEach((card) => {
    card.addEventListener("click", () => openModal(card.dataset.id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(card.dataset.id);
      }
    });
  });
}

let activeFilter = "all";
const projectGrid = document.getElementById("projectGrid");
const filterBar = document.getElementById("filterBar");
const projectCount = document.getElementById("projectCount");

function isLearningProject(p) {
  return /based on|udemy|tutorial|online videos|online vidoes/i.test(`${p.subtitle || ""} ${(p.links || []).map(l => l.text).join(" ")}`);
}

function renderProjects() {
  const archive = PROJECTS.filter((p) => !FEATURED_IDS.includes(p.id));
  const items = archive.filter((p) => activeFilter === "all" || p.category === activeFilter);
  const rank = { unreal: 0, unity: 1, others: 2 };
  items.sort((a, b) => (rank[a.category] ?? 9) - (rank[b.category] ?? 9));
  projectCount.textContent = `${items.length} project${items.length === 1 ? "" : "s"}`;

  projectGrid.innerHTML = items.map((p) => {
    const learning = isLearningProject(p);
    const badge = learning ? "Learning project" : (p.category === "unreal" ? "Unreal" : p.category === "unity" ? "Unity" : "Other");
    return `
      <article class="project-card" data-id="${p.id}" tabindex="0" role="button" aria-label="Open ${p.title} details">
        <div class="project-thumb">
          <span class="project-badge ${learning ? "learning" : ""}">${badge}</span>
          <img src="${p.img}" alt="${p.title}" loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='grid'">
          <div class="media-fallback" style="display:none">${p.title}</div>
        </div>
        <div class="project-info">
          <h3>${p.title}</h3>
          <p>${p.catLabel || p.subtitle || "Project"}</p>
        </div>
      </article>`;
  }).join("");

  projectGrid.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("click", () => openModal(card.dataset.id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(card.dataset.id);
      }
    });
  });
}

filterBar.addEventListener("click", (event) => {
  const btn = event.target.closest(".filter-btn");
  if (!btn) return;
  filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  activeFilter = btn.dataset.filter;
  renderProjects();
});

const backdrop = document.getElementById("modalBackdrop");
const modalClose = document.getElementById("modalClose");
const modalMedia = document.getElementById("modalMedia");
const modalKicker = document.getElementById("modalKicker");
const modalTitle = document.getElementById("modalTitle");
const modalSummary = document.getElementById("modalSummary");
const modalCaseDetail = document.getElementById("modalCaseDetail");
const modalBullets = document.getElementById("modalBullets");
const modalLinks = document.getElementById("modalLinks");
let lastFocused = null;

function openModal(id) {
  const p = projectById(id);
  if (!p) return;
  const c = CASE_STUDIES[id];
  lastFocused = document.activeElement;

  modalKicker.textContent = c?.kicker || p.catLabel || p.category;
  modalTitle.textContent = p.title;
  modalSummary.textContent = c?.summary || p.subtitle || "Selected project from my game-development archive.";

  modalMedia.innerHTML = "";
  if (p.videos?.length) {
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.src = p.videos[0];
    video.poster = p.img || "";
    video.addEventListener("error", () => {
      modalMedia.innerHTML = `<div class="media-fallback">Media path preserved — add your full assets folder to view it.</div>`;
    }, { once: true });
    modalMedia.appendChild(video);
  } else if (p.img) {
    modalMedia.innerHTML = `<img src="${p.img}" alt="${p.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid'"><div class="media-fallback" style="display:none">Media path preserved — add your full assets folder to view it.</div>`;
  } else {
    modalMedia.innerHTML = `<div class="media-fallback">Technical case study</div>`;
  }

  modalCaseDetail.innerHTML = c ? Object.entries(c.facts).map(([label, value]) => `
    <div class="case-detail-row"><strong>${label}</strong><span>${value}</span></div>`).join("") : "";

  modalBullets.innerHTML = (p.bullets || []).filter(Boolean).map((b) => `<li>${b}</li>`).join("");
  modalLinks.innerHTML = (p.links || []).map((l) => `<a href="${l.href}" target="_blank" rel="noopener">${l.text} ↗</a>`).join("");

  backdrop.classList.add("open");
  backdrop.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modalClose.focus();
}

function closeModal() {
  backdrop.classList.remove("open");
  backdrop.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  modalMedia.innerHTML = "";
  lastFocused?.focus?.();
}

modalClose.addEventListener("click", closeModal);
backdrop.addEventListener("click", (event) => {
  if (event.target === backdrop) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && backdrop.classList.contains("open")) closeModal();
});

const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");
navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  nav.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}));

renderCaseStudies();
renderProjects();

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .08 });
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
}
