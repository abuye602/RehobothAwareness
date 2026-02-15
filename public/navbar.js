document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("siteNav");
  const toggleBtn = document.querySelector(".nav-toggle");

  const aboutItem = document.querySelector(".nav-about");
  const aboutBtn = document.querySelector(".dropdown-btn");

  const donateDropdown = document.getElementById("donateDropdown");

  let scrollY = 0;

  function openMenu() {
    scrollY = window.scrollY;
    nav.classList.add("is-open");
    toggleBtn.classList.add("is-open");
    toggleBtn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("menu-open"); // html
    document.body.classList.add("menu-open");
    // lock at current scroll position
    document.body.style.top = `-${scrollY}px`;
  }

  function closeMenu() {
    nav.classList.remove("is-open");
    toggleBtn.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("menu-open");
    document.body.classList.remove("menu-open");
    // unlock + restore scroll position
    document.body.style.top = "";
    window.scrollTo(0, scrollY);
    aboutItem?.classList.remove("open");
    aboutBtn?.setAttribute("aria-expanded", "false");
    if (donateDropdown) donateDropdown.open = false;
  }

  function isMobile() {
    return window.matchMedia("(max-width: 767px)").matches;
  }

  // Hamburger toggle (mobile)
  toggleBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    nav.classList.contains("is-open") ? closeMenu() : openMenu();
  });

  // About toggle (mobile)
  aboutBtn?.addEventListener("click", (e) => {
    // desktop should keep hover behavior
    if (!isMobile()) return;

    e.preventDefault();
    e.stopPropagation();
    const open = aboutItem.classList.toggle("open");
    aboutBtn.setAttribute("aria-expanded", String(open));
  });

  // Close menu when clicking a link (mobile)
  nav?.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link && isMobile()) closeMenu();
  });

  // Click outside closes nav + donate
  document.addEventListener("click", (e) => {
    const clickedToggle = toggleBtn?.contains(e.target);
    const clickedNav = nav?.contains(e.target);
    const clickedDonate = donateDropdown?.contains(e.target);

    // close donate if open and you clicked outside it
    if (donateDropdown?.open && !clickedDonate) donateDropdown.open = false;

    // close mobile menu if open and clicked outside both nav + toggle
    if (
      isMobile() &&
      nav?.classList.contains("is-open") &&
      !clickedNav &&
      !clickedToggle
    ) {
      closeMenu();
    }
  });

  // ESC closes everything
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      // focus donate summary for nicer UX if donate was open
      donateDropdown?.querySelector("summary")?.focus();
    }
  });

  // If screen resized to desktop while menu open, reset
  window.addEventListener("resize", () => {
    if (!isMobile()) {
      nav.classList.remove("is-open");
      toggleBtn?.setAttribute("aria-expanded", "false");
      aboutItem?.classList.remove("open");
      aboutBtn?.setAttribute("aria-expanded", "false");
    }
  });
});
