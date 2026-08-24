document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.querySelector(".event-gallery");
  if (!gallery) return;

  const viewport = gallery.querySelector(".gallery-viewport");
  const track = gallery.querySelector(".gallery-track");
  const slides = Array.from(gallery.querySelectorAll(".gallery-slide"));
  const previousButton = gallery.querySelector(".gallery-button--prev");
  const nextButton = gallery.querySelector(".gallery-button--next");
  const counter = gallery.querySelector(".current-slide");
  const dotsContainer = gallery.querySelector(".gallery-dots");
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let currentIndex = 0;
  let autoplayTimer;
  let touchStartX = 0;
  let touchEndX = 0;

  slides.forEach((slide, index) => {
    const image = slide.querySelector("img");
    const dot = document.createElement("button");

    dot.className = "gallery-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show photo ${index + 1}`);
    dot.addEventListener("click", () => {
      showSlide(index);
      restartAutoplay();
    });
    dotsContainer.appendChild(dot);

    const markLoaded = () => {
      image.classList.remove("is-missing");
      slide.classList.add("has-image");
    };
    const markMissing = () => {
      image.classList.add("is-missing");
      slide.classList.remove("has-image");
    };

    image.addEventListener("load", markLoaded);
    image.addEventListener("error", markMissing);
    if (image.complete) {
      image.naturalWidth > 0 ? markLoaded() : markMissing();
    }
  });

  const dots = Array.from(dotsContainer.querySelectorAll(".gallery-dot"));

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    counter.textContent = String(currentIndex + 1).padStart(2, "0");

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  function stopAutoplay() {
    window.clearInterval(autoplayTimer);
  }

  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    autoplayTimer = window.setInterval(
      () => showSlide(currentIndex + 1),
      6000,
    );
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  previousButton.addEventListener("click", () => {
    showSlide(currentIndex - 1);
    restartAutoplay();
  });

  nextButton.addEventListener("click", () => {
    showSlide(currentIndex + 1);
    restartAutoplay();
  });

  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      showSlide(currentIndex - 1);
      restartAutoplay();
    }
    if (event.key === "ArrowRight") {
      showSlide(currentIndex + 1);
      restartAutoplay();
    }
  });

  viewport.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
      stopAutoplay();
    },
    { passive: true },
  );

  viewport.addEventListener(
    "touchend",
    (event) => {
      touchEndX = event.changedTouches[0].clientX;
      const swipeDistance = touchEndX - touchStartX;

      if (Math.abs(swipeDistance) > 50) {
        showSlide(currentIndex + (swipeDistance < 0 ? 1 : -1));
      }
      startAutoplay();
    },
    { passive: true },
  );

  gallery.addEventListener("mouseenter", stopAutoplay);
  gallery.addEventListener("mouseleave", startAutoplay);
  gallery.addEventListener("focusin", stopAutoplay);
  gallery.addEventListener("focusout", startAutoplay);

  document.addEventListener("visibilitychange", () => {
    document.hidden ? stopAutoplay() : startAutoplay();
  });

  showSlide(0);
  startAutoplay();
});
