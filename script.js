const debugPanel = document.getElementById("debugPanel");
const debugToggle = document.getElementById("debugToggle");
const vpSize = document.getElementById("vpSize");
const scrollYNode = document.getElementById("scrollY");
const activeSectionNode = document.getElementById("activeSection");

const navLinks = Array.from(document.querySelectorAll(".nav-list a"));
const revealNodes = Array.from(document.querySelectorAll(".reveal"));
const sections = Array.from(document.querySelectorAll("main section[id]"));

function toggleDebugPanel() {
  debugPanel.classList.toggle("open");
}

function updateViewportStats() {
  vpSize.textContent = `${window.innerWidth} x ${window.innerHeight}`;
  scrollYNode.textContent = String(Math.round(window.scrollY));
}

function updateActiveNav() {
  const focusLine = window.scrollY + window.innerHeight * 0.3;
  let activeId = sections[0]?.id || "top";

  sections.forEach((section) => {
    if (focusLine >= section.offsetTop) {
      activeId = section.id;
    }
  });

  activeSectionNode.textContent = activeId;

  navLinks.forEach((link) => {
    const target = link.getAttribute("href")?.replace("#", "") || "";
    link.classList.toggle("active", target === activeId);
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -6% 0px"
  }
);

revealNodes.forEach((node) => revealObserver.observe(node));

debugToggle.addEventListener("click", toggleDebugPanel);

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "d") {
    toggleDebugPanel();
  }
});

window.addEventListener("resize", updateViewportStats);

window.addEventListener("scroll", () => {
  updateViewportStats();
  updateActiveNav();
});

updateViewportStats();
updateActiveNav();