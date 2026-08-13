/* ============================================================
   KSV MALAVALI VILLA — Main Script
   Vanilla JS • No frameworks
   ============================================================ */

(function () {
  "use strict";

  /* ============================================================
     HELPER UTILITIES
     ============================================================ */

  const $ = (selector, context = document) =>
    context.querySelector(selector);

  const $$ = (selector, context = document) =>
    Array.from(context.querySelectorAll(selector));

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  document.documentElement.classList.add("js-enabled");


  /* ============================================================
     PRELOADER
     ============================================================ */

  const preloader = $("#preloader");

  function hidePreloader() {
    if (!preloader) return;

    preloader.classList.add("hidden");
    document.body.classList.remove("nav-locked");

    setTimeout(() => {
      $$(".hero .reveal").forEach((element, index) => {
        setTimeout(() => {
          element.classList.add("visible");
        }, index * 120);
      });
    }, 200);
  }

  window.addEventListener("load", () => {
    setTimeout(hidePreloader, 700);

    setTimeout(() => {
      if (
        preloader &&
        !preloader.classList.contains("hidden")
      ) {
        hidePreloader();
      }
    }, 3500);
  });

  setTimeout(() => {
    if (
      preloader &&
      !preloader.classList.contains("hidden")
    ) {
      hidePreloader();
    }
  }, 5000);

  document.body.classList.add("nav-locked");


  /* ============================================================
     STICKY NAVBAR + SCROLL TOP
     ============================================================ */

  const navbar = $("#navbar");
  const scrollTopBtn = $("#scrollTop");

  function onScroll() {
    const scrollY = window.scrollY;

    if (navbar) {
      navbar.classList.toggle("scrolled", scrollY > 60);
    }

    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle("show", scrollY > 600);
    }

    highlightActiveLink();
    handleMobileBar();
    applyParallax();
  }

  window.addEventListener("scroll", onScroll, {
    passive: true
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  }


  /* ============================================================
     MOBILE NAVIGATION
     ============================================================ */

  const navToggle = $("#navToggle");
  const navLinks = $("#navLinks");
  const mobileCta = $(".nav-cta-mobile");

  const navOverlay = document.createElement("div");
  navOverlay.className = "nav-overlay";
  document.body.appendChild(navOverlay);

  function closeMenu() {
    if (!navLinks || !navToggle) return;

    navLinks.classList.remove("open");
    navToggle.classList.remove("open");

    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");

    navOverlay.classList.remove("show");

    if (!lightbox?.classList.contains("open")) {
      document.body.classList.remove("nav-locked");
    }
  }

  function openMenu() {
    if (!navLinks || !navToggle) return;

    navLinks.classList.add("open");
    navToggle.classList.add("open");

    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");

    navOverlay.classList.add("show");

    document.body.classList.add("nav-locked");
  }

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      if (navLinks?.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  navOverlay.addEventListener("click", closeMenu);

  $$(".nav-link", navLinks || document).forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  if (mobileCta) {
    mobileCta.addEventListener("click", closeMenu);
  }


  /* ============================================================
     ESCAPE KEY
     ============================================================ */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();

      if (lightbox?.classList.contains("open")) {
        closeLightbox();
      }
    }
  });


  /* ============================================================
     ACTIVE NAV LINK / SCROLL SPY
     ============================================================ */

  const sections = $$("section[id]");
  const navAnchors = $$(".nav-link");

  function highlightActiveLink() {
    if (!sections.length || !navAnchors.length) return;

    const scrollPosition = window.scrollY + 150;
    let currentId = "";

    sections.forEach((section) => {
      if (scrollPosition >= section.offsetTop) {
        currentId = section.id;
      }
    });

    navAnchors.forEach((anchor) => {
      const href = anchor.getAttribute("href");

      anchor.classList.toggle(
        "active",
        href === `#${currentId}`
      );
    });
  }


  /* ============================================================
     SMOOTH ANCHOR SCROLL
     ============================================================ */

  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");

      if (!targetId || targetId === "#") return;

      let target;

      try {
        target = document.querySelector(targetId);
      } catch {
        return;
      }

      if (!target) return;

      event.preventDefault();

      const headerOffset = 78;

      const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerOffset;

      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: prefersReducedMotion
          ? "auto"
          : "smooth"
      });

      if (history.pushState) {
        history.pushState(null, "", targetId);
      }
    });
  });


  /* ============================================================
     SCROLL REVEAL
     ============================================================ */

  const revealElements = $$(".reveal");
  const staggerParents = new Set();

  if (
    "IntersectionObserver" in window &&
    !prefersReducedMotion
  ) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target;
          const parent = element.parentElement;

          const isStaggerGroup =
            parent &&
            (
              parent.classList.contains("highlights-grid") ||
              parent.classList.contains("amenities-grid") ||
              parent.classList.contains("perfect-grid")
            );

          if (isStaggerGroup) {
            if (staggerParents.has(parent)) return;

            staggerParents.add(parent);

            const siblings = Array.from(
              parent.children
            ).filter((child) =>
              child.classList.contains("reveal")
            );

            siblings.forEach((sibling, index) => {
              setTimeout(() => {
                sibling.classList.add("visible");
              }, index * 80);

              observer.unobserve(sibling);
            });

            return;
          }

          element.classList.add("visible");
          observer.unobserve(element);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  /* Safety fallback */
  window.addEventListener("load", () => {
    setTimeout(() => {
      revealElements.forEach((element) => {
        if (element.classList.contains("visible")) return;

        const rect = element.getBoundingClientRect();

        if (
          rect.top < window.innerHeight &&
          rect.bottom > 0
        ) {
          element.classList.add("visible");
        }
      });
    }, 400);
  });

  /* Absolute fallback */
  setTimeout(() => {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }, 3000);


  /* ============================================================
     PARALLAX BACKGROUNDS
     ============================================================ */

  const parallaxBgs = $$(".parallax-bg");

  function applyParallax() {
    if (prefersReducedMotion) return;
    if (!parallaxBgs.length) return;

    parallaxBgs.forEach((background) => {
      if (background.id === "heroMedia") return;

      const parent = background.parentElement;

      if (!parent) return;

      const rect = parent.getBoundingClientRect();

      if (
        rect.bottom < 0 ||
        rect.top > window.innerHeight
      ) {
        return;
      }

      const offset =
        (
          rect.top +
          rect.height / 2 -
          window.innerHeight / 2
        ) * 0.18;

      background.style.transform =
        `translate3d(0, ${offset}px, 0)`;
    });
  }


  /* ============================================================
     HERO MOUSE PARALLAX
     ============================================================ */

  const heroMedia = $("#heroMedia");

  if (
    heroMedia &&
    !prefersReducedMotion &&
    window.matchMedia("(min-width: 1024px)").matches
  ) {
    let mouseX = 0;
    let mouseY = 0;
    let rafId = null;

    function updateHeroParallax() {
      heroMedia.style.transform =
        `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      rafId = null;
    }

    window.addEventListener("mousemove", (event) => {
      mouseX =
        (event.clientX / window.innerWidth - 0.5) * 10;

      mouseY =
        (event.clientY / window.innerHeight - 0.5) * 7;

      if (!rafId) {
        rafId = requestAnimationFrame(
          updateHeroParallax
        );
      }
    });
  }


  /* ============================================================
     ANIMATED COUNTERS
     ============================================================ */

  const counters = $$(".counter");

  if ("IntersectionObserver" in window) {
    const counterObserver =
      new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const element = entry.target;

            const target =
              parseInt(
                element.dataset.target,
                10
              ) || 0;

            if (prefersReducedMotion) {
              element.textContent = target;
              observer.unobserve(element);
              return;
            }

            const duration = 1600;
            const startTime = performance.now();

            function animateCounter(currentTime) {
              const progress = Math.min(
                (currentTime - startTime) /
                  duration,
                1
              );

              const eased =
                1 -
                Math.pow(
                  1 - progress,
                  3
                );

              element.textContent =
                Math.floor(
                  eased * target
                );

              if (progress < 1) {
                requestAnimationFrame(
                  animateCounter
                );
              } else {
                element.textContent = target;
              }
            }

            requestAnimationFrame(
              animateCounter
            );

            observer.unobserve(element);
          });
        },
        {
          threshold: 0.5
        }
      );

    counters.forEach((counter) => {
      counterObserver.observe(counter);
    });
  } else {
    counters.forEach((counter) => {
      counter.textContent =
        counter.dataset.target || "0";
    });
  }


  /* ============================================================
     GALLERY FILTER
     ============================================================ */

  const filterBtns = $$(".filter-btn");
  const galleryItems = $$(".gallery-item");

  filterBtns.forEach((button) => {
    button.addEventListener("click", () => {
      const filter =
        button.dataset.filter || "all";

      filterBtns.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute(
          "aria-selected",
          "false"
        );
      });

      button.classList.add("active");
      button.setAttribute(
        "aria-selected",
        "true"
      );

      galleryItems.forEach((item) => {
        const category =
          item.dataset.category;

        const matches =
          filter === "all" ||
          category === filter;

        item.classList.toggle(
          "hide",
          !matches
        );
      });
    });
  });


  /* ============================================================
     LIGHTBOX
     ============================================================ */

  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightboxImg");
  const lightboxCaption = $("#lightboxCaption");
  const lightboxClose = $("#lightboxClose");
  const lightboxPrev = $("#lightboxPrev");
  const lightboxNext = $("#lightboxNext");

  let currentIndex = 0;

  function getVisibleGalleryItems() {
    return galleryItems.filter(
      (item) =>
        !item.classList.contains("hide")
    );
  }

  function updateLightbox() {
    const items =
      getVisibleGalleryItems();

    if (!items.length) return;

    currentIndex =
      (
        currentIndex +
        items.length
      ) % items.length;

    const item = items[currentIndex];

    const image = $("img", item);

    if (!image || !lightboxImg) return;

    /*
      IMPORTANT:
      Images are now local JPG/PNG files.
      No external URL manipulation.
    */

    lightboxImg.src =
      image.currentSrc ||
      image.src;

    lightboxImg.alt =
      image.alt || "KSV Malavali Villa";

    const caption =
      $("figcaption span", item);

    if (lightboxCaption) {
      lightboxCaption.textContent =
        caption
          ? caption.textContent
          : "";
    }
  }

  function openLightbox(index) {
    if (!lightbox) return;

    const items =
      getVisibleGalleryItems();

    if (!items.length) return;

    currentIndex =
      Math.max(
        0,
        Math.min(
          index,
          items.length - 1
        )
      );

    updateLightbox();

    lightbox.classList.add("open");

    document.body.classList.add(
      "nav-locked"
    );

    if (lightboxClose) {
      setTimeout(() => {
        lightboxClose.focus();
      }, 50);
    }
  }

  function closeLightbox() {
    if (!lightbox) return;

    lightbox.classList.remove("open");

    if (
      !navLinks?.classList.contains("open")
    ) {
      document.body.classList.remove(
        "nav-locked"
      );
    }

    if (lightboxImg) {
      /*
        Keep image source intact.
        It avoids broken-image flash when reopening.
      */
    }
  }

  function navigateLightbox(direction) {
    const items =
      getVisibleGalleryItems();

    if (!items.length) return;

    currentIndex =
      (
        currentIndex +
        direction +
        items.length
      ) % items.length;

    updateLightbox();
  }

  /*
    IMPORTANT FIX:
    The clicked item's index is calculated
    from currently visible items.
  */

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const visibleItems =
        getVisibleGalleryItems();

      const index =
        visibleItems.indexOf(item);

      if (index === -1) return;

      openLightbox(index);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener(
      "click",
      closeLightbox
    );
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();
        navigateLightbox(-1);
      }
    );
  }

  if (lightboxNext) {
    lightboxNext.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();
        navigateLightbox(1);
      }
    );
  }

  if (lightbox) {
    lightbox.addEventListener(
      "click",
      (event) => {
        if (event.target === lightbox) {
          closeLightbox();
        }
      }
    );
  }

  document.addEventListener(
    "keydown",
    (event) => {
      if (
        !lightbox?.classList.contains("open")
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigateLightbox(-1);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        navigateLightbox(1);
      }
    }
  );


  /* ============================================================
     FAQ ACCORDION
     ============================================================ */

  const faqItems = $$(".faq-item");

  faqItems.forEach((item) => {
    const question =
      $(".faq-question", item);

    const answer =
      $(".faq-answer", item);

    if (!question || !answer) return;

    question.addEventListener(
      "click",
      () => {
        const isOpen =
          item.classList.contains(
            "active"
          );

        faqItems.forEach((other) => {
          other.classList.remove(
            "active"
          );

          const otherQuestion =
            $(".faq-question", other);

          const otherAnswer =
            $(".faq-answer", other);

          if (otherQuestion) {
            otherQuestion.setAttribute(
              "aria-expanded",
              "false"
            );
          }

          if (otherAnswer) {
            otherAnswer.style.maxHeight =
              null;
          }
        });

        if (!isOpen) {
          item.classList.add("active");

          question.setAttribute(
            "aria-expanded",
            "true"
          );

          answer.style.maxHeight =
            `${answer.scrollHeight}px`;
        }
      }
    );
  });


  /* ============================================================
     3D TILT EFFECT
     ============================================================ */

  const tiltCards = $$(
    ".highlight-card, .room-card"
  );

  if (
    window.matchMedia(
      "(min-width: 1024px)"
    ).matches &&
    !prefersReducedMotion
  ) {
    tiltCards.forEach((card) => {
      card.addEventListener(
        "mousemove",
        (event) => {
          const rect =
            card.getBoundingClientRect();

          const x =
            (event.clientX -
              rect.left) /
              rect.width -
            0.5;

          const y =
            (event.clientY -
              rect.top) /
              rect.height -
            0.5;

          card.style.transform =
            `perspective(900px)
             rotateY(${x * 5}deg)
             rotateX(${y * -5}deg)
             translateY(-6px)`;
        }
      );

      card.addEventListener(
        "mouseleave",
        () => {
          card.style.transform = "";
        }
      );
    });
  }


  /* ============================================================
     FOOTER YEAR
     ============================================================ */

  const yearElement = $("#year");

  if (yearElement) {
    yearElement.textContent =
      new Date().getFullYear();
  }


  /* ============================================================
     MOBILE BOTTOM BAR
     ============================================================ */

  const mobileBar =
    $(".mobile-bar");

  function handleMobileBar() {
    if (!mobileBar) return;

    if (window.innerWidth > 767) {
      mobileBar.style.opacity = "";
      mobileBar.style.pointerEvents = "";
      return;
    }

    const bookingSection =
      $("#booking");

    if (!bookingSection) return;

    const rect =
      bookingSection.getBoundingClientRect();

    const bookingVisible =
      rect.top <
        window.innerHeight * 0.75 &&
      rect.bottom > 0;

    if (bookingVisible) {
      mobileBar.style.opacity = "0";
      mobileBar.style.pointerEvents =
        "none";
    } else {
      mobileBar.style.opacity = "1";
      mobileBar.style.pointerEvents =
        "auto";
    }
  }


  /* ============================================================
     IMAGE ERROR HANDLING
     ============================================================ */

  $$("img").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        /*
          Do NOT remove the src.

          Removing src can create unwanted
          broken-image behaviour and can make
          debugging local JPG/PNG paths difficult.

          Instead, mark the image as broken.
        */

        image.classList.add(
          "image-error"
        );
      },
      { once: true }
    );
  });


  /* ============================================================
     RESIZE HANDLER
     ============================================================ */

  let resizeTimer;

  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        handleMobileBar();

        /*
          Recalculate open FAQ height
          after viewport resize.
        */

        const activeFaq =
          $(".faq-item.active");

        if (activeFaq) {
          const answer =
            $(".faq-answer", activeFaq);

          if (answer) {
            answer.style.maxHeight =
              `${answer.scrollHeight}px`;
          }
        }
      }, 150);
    },
    { passive: true }
  );


  /* ============================================================
     INITIAL STATE
     ============================================================ */

  highlightActiveLink();
  applyParallax();
  handleMobileBar();

})();