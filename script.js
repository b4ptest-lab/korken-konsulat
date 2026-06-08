/* ===================================================================
   KORKEN KONSULAT — Interaktionen
   - Header-Zustand beim Scrollen
   - Mobile-Navigation
   - Scroll-Reveal (IntersectionObserver)
   - Aktiver Navigationspunkt
   - Newsletter-Anmeldung via mailto
   =================================================================== */
(function () {
  "use strict";

  const header   = document.getElementById("siteHeader");
  const navToggle = document.getElementById("navToggle");
  const nav       = document.querySelector(".nav");
  const navList   = document.getElementById("navList");

  /* ---------- Jahr im Footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header beim Scrollen ---------- */
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 24) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile-Navigation ---------- */
  const closeNav = () => {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Menü öffnen");
  };
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });
    navList.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  /* ---------- Scroll-Reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Aktiver Navigationspunkt (Scroll-Spy) ---------- */
  const sections = ["mission", "tastings", "events", "kontakt"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = Array.from(navList ? navList.querySelectorAll("a") : []);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((a) =>
              a.classList.toggle("active", a.getAttribute("href") === "#" + id)
            );
          }
        });
      },
      { threshold: 0.5, rootMargin: "-20% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Sanfter Parallax (Claim-Band) ---------- */
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const parallaxImg = document.querySelector(".claim-media img");
  if (parallaxImg && !prefersReduced) {
    let ticking = false;
    const band = parallaxImg.closest(".claim-band");
    const update = () => {
      const rect = band.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom > 0 && rect.top < vh) {
        // -1 .. 1 über den Sichtbereich
        const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        parallaxImg.style.transform = "translateY(" + progress * -8 + "%)";
      }
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ---------- Newsletter via mailto ---------- */
  const form  = document.getElementById("newsletterForm");
  const input = document.getElementById("newsletterEmail");
  const error = document.getElementById("newsletterError");

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  if (form && input && error) {
    // Inline-Validierung erst nach Verlassen des Feldes
    input.addEventListener("blur", () => {
      if (input.value && !isValidEmail(input.value)) {
        input.classList.add("invalid");
        error.textContent = "Bitte gib eine gültige E-Mail-Adresse ein.";
      }
    });
    input.addEventListener("input", () => {
      input.classList.remove("invalid");
      error.textContent = "";
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = input.value.trim();

      if (!isValidEmail(value)) {
        input.classList.add("invalid");
        error.textContent = "Bitte gib eine gültige E-Mail-Adresse ein.";
        input.focus();
        return;
      }

      const subject = encodeURIComponent("Newsletter-Anmeldung Korken Konsulat");
      const body = encodeURIComponent(
        "Hallo Peter,\n\nich möchte den Newsletter des Korken Konsulat abonnieren.\n\n" +
        "E-Mail: " + value + "\n\nViele Grüße"
      );
      window.location.href =
        "mailto:info@korken-konsulat.de?subject=" + subject + "&body=" + body;

      form.classList.add("sent");
      error.textContent = "";
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.textContent = "E-Mail-Programm geöffnet ✓";
    });
  }
})();
