(function () {
  var NEON_COLORS = ["#ccff33", "#39ff14", "#ff2ec4", "#00e5ff", "#b026ff", "#ff6a00", "#faff00", "#ff2b5e"];
  window.randomizeAccentColors = function () {
    var chosen = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    document.documentElement.style.setProperty("--color-accent", chosen);
    var chosenProject = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    document.documentElement.style.setProperty("--color-project-accent", chosenProject);
    var chosenIndex = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    document.documentElement.style.setProperty("--color-index-accent", chosenIndex);
  };
  window.randomizeAccentColors();

  if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
    try {
    var cursorEl = document.createElement("div");
    cursorEl.id = "custom-cursor";

    // A welcoming digital ghost hand: a soft palm with five relaxed,
    // spread fingers, rendered as rounded capsules rather than a pixel
    // grid so it actually reads as a hand. Palm faces the viewer, fingers
    // open in greeting.
    var wristX = 50;
    var wristY = 115;
    var ghostShape =
      // A welcoming open hand, palm toward the viewer, fingers relaxed and
      // extended together like an abhaya mudra (the Buddhist gesture of
      // reassurance). Palm: wider near the fingers, a thenar bulge on the
      // thumb side, a softer hypothenar bulge on the pinky side, tapering
      // to a wrist.
      '<path d="M33 66 Q18 74 24 88 Q28 105 42 113 L58 113 Q72 105 76 88 Q82 74 67 66 Q50 74 33 66 Z"/>' +
      '<line class="ghost-thumb" x1="30" y1="84" x2="9" y2="68" stroke-width="15"/>' + // thumb, off the palm's side
      '<line class="ghost-index" x1="38" y1="68" x2="27" y2="28" stroke-width="11"/>' + // index
      '<line class="ghost-middle" x1="50" y1="65" x2="50" y2="18" stroke-width="12"/>' + // middle
      '<line class="ghost-ring" x1="62" y1="68" x2="73" y2="28" stroke-width="11"/>' + // ring
      '<line class="ghost-pinky" x1="70" y1="74" x2="85" y2="42" stroke-width="9"/>' + // pinky
      // Faint palm creases for texture.
      '<path class="ghost-crease" d="M30 78 Q45 92 68 82" stroke-width="1.4" fill="none"/>' +
      '<path class="ghost-crease" d="M27 90 Q46 100 64 98" stroke-width="1.4" fill="none"/>';
    cursorEl.innerHTML =
      '<svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<g id="ghost-hand-shape" stroke="currentColor" stroke-linecap="round" fill="currentColor">' + ghostShape + "</g>" +
      '<radialGradient id="gem-shine" cx="35%" cy="30%" r="75%">' +
      '<stop offset="0%" style="stop-color:#ffffff"/>' +
      '<stop offset="45%" style="stop-color:var(--color-project-accent)"/>' +
      '<stop offset="100%" style="stop-color:var(--color-project-accent)"/>' +
      "</radialGradient>" +
      "</defs>" +
      '<g class="cursor-hand-wave" style="transform-origin:' + wristX + "px " + wristY + 'px">' +
      '<use href="#ghost-hand-shape" class="ghost-layer ghost-cyan" x="-1.6"/>' +
      '<use href="#ghost-hand-shape" class="ghost-layer ghost-magenta" x="1.6"/>' +
      '<use href="#ghost-hand-shape" class="ghost-layer ghost-main"/>' +
      '<circle class="ghost-gem-ring ghost-gem-ring-1" cx="50" cy="90" r="6" style="stroke:var(--color-project-accent)"/>' +
      '<circle class="ghost-gem-ring ghost-gem-ring-2" cx="50" cy="90" r="6" style="stroke:var(--color-project-accent)"/>' +
      '<circle class="ghost-palm-dot" cx="50" cy="90" r="6" fill="url(#gem-shine)"/>' +
      '<circle class="ghost-gem-glint" cx="47.8" cy="87.4" r="1.6" fill="#ffffff"/>' +
      '<g class="ghost-gem-sparkle" transform="translate(50 90)">' +
      '<path d="M0 -9 L0 9 M-9 0 L9 0" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round"/>' +
      "</g>" +
      "</g></svg>";
    var storedX = sessionStorage.getItem("cursorX");
    var storedY = sessionStorage.getItem("cursorY");
    if (storedX !== null && storedY !== null) {
      cursorEl.style.transition = "none";
      cursorEl.style.left = storedX + "px";
      cursorEl.style.top = storedY + "px";
      cursorEl.classList.add("is-visible");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          cursorEl.style.transition = "";
        });
      });
    }
    document.body.appendChild(cursorEl);

    var lastCursorX = storedX !== null ? parseFloat(storedX) : null;
    var lastCursorY = storedY !== null ? parseFloat(storedY) : null;
    document.addEventListener("mousemove", function (e) {
      lastCursorX = e.clientX;
      lastCursorY = e.clientY;
      cursorEl.style.left = e.clientX + "px";
      cursorEl.style.top = e.clientY + "px";
      if (!cursorEl.classList.contains("is-visible")) {
        cursorEl.classList.add("is-visible");
      }
    });
    document.addEventListener("mouseleave", function () {
      cursorEl.classList.remove("is-visible");
    });
    window.addEventListener("pagehide", function () {
      if (lastCursorX !== null && lastCursorY !== null) {
        sessionStorage.setItem("cursorX", lastCursorX);
        sessionStorage.setItem("cursorY", lastCursorY);
      }
    });

    var waveTimer = null;
    document.addEventListener("click", function (e) {
      if (e.target.closest("a, button, [role='button']")) return;
      cursorEl.classList.remove("is-waving");
      void cursorEl.offsetWidth;
      cursorEl.classList.add("is-waving");
      clearTimeout(waveTimer);
      waveTimer = setTimeout(function () {
        cursorEl.classList.remove("is-waving");
      }, 600);
    });

    var pushTimer = null;
    window.triggerCursorPush = function () {
      cursorEl.classList.remove("is-pushing");
      void cursorEl.offsetWidth;
      cursorEl.classList.add("is-pushing");
      clearTimeout(pushTimer);
      pushTimer = setTimeout(function () {
        cursorEl.classList.remove("is-pushing");
      }, 400);
    };
    document.addEventListener("click", function (e) {
      if (e.target.closest(".formkit-input, .formkit-submit")) {
        window.triggerCursorPush();
      }
    });

    var ghostHandShape = cursorEl.querySelector("#ghost-hand-shape");
    var PINCH_SELECTOR = ".main-nav a, .thumb-sidebar .thumb-button, .project-index-link, .logo, .icon-link, .back-button, .formkit-input";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(PINCH_SELECTOR)) {
        cursorEl.classList.add("is-hovering-link");
        if (ghostHandShape) ghostHandShape.classList.add("is-pinching");
      }
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(PINCH_SELECTOR)) {
        cursorEl.classList.remove("is-hovering-link");
        if (ghostHandShape) ghostHandShape.classList.remove("is-pinching");
      }
    });
    } catch (err) {
      console.error("custom cursor failed to init", err);
    }
  }

  var enterEls = document.querySelectorAll(".page-enter");
  if (enterEls.length) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        enterEls.forEach(function (el) {
          el.classList.remove("page-enter");
        });
      });
    });
  }
})();

document.addEventListener("DOMContentLoaded", function () {
  var targets = document.querySelectorAll(".reveal");

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach(function (target) {
    observer.observe(target);
  });

  function closeDropdowns() {
    document.querySelectorAll(".has-dropdown.is-open").forEach(function (el) {
      el.classList.remove("is-open");
      el.querySelector(".dropdown-toggle").setAttribute("aria-expanded", "false");
    });
  }

  document.querySelectorAll(".has-dropdown > .dropdown-toggle").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var parent = btn.closest(".has-dropdown");
      var isOpen = parent.classList.contains("is-open");
      closeDropdowns();
      if (!isOpen) {
        parent.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", closeDropdowns);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDropdowns();
  });

  var CART_STORAGE_KEY = "hueyb_cart";

  function getCart() {
    try {
      var raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function updateCartBadge() {
    var badge = document.querySelector(".cart-badge");
    if (!badge) return;
    var count = getCart().reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
    badge.textContent = count;
  }

  function saveCart(items) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
    updateCartBadge();
  }

  function addToCart(entry) {
    var cart = getCart();
    var existing = cart.filter(function (item) {
      return item.slug === entry.slug && item.variantLabel === entry.variantLabel;
    })[0];
    if (existing) {
      existing.quantity += 1;
    } else {
      entry.quantity = 1;
      cart.push(entry);
    }
    saveCart(cart);
  }

  function removeFromCart(index) {
    var cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
  }

  updateCartBadge();

  var studioGrid = document.getElementById("studio-grid");
  if (studioGrid) {
    var studioTileLinks = studioGrid.querySelectorAll("a.tile");
    studioTileLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        var href = link.href;
        document.body.classList.add("page-fade-out");
        setTimeout(function () {
          window.location.href = href;
        }, 420);
      });
    });
  }

  // Plays the hero video from a random point, always forward. Reverse
  // playback (manually stepping currentTime backward on a timer) was
  // removed - JS-driven seeking is fundamentally not how browsers are
  // built to play video smoothly, and it was the actual cause of the
  // choppiness/frame drops, not the resolution/bitrate/process issues
  // fixed earlier. Native play() + native "ended" is what's fast here.
  window.heroVideoPlayer = (function () {
    var activeVideo = null;
    var endedListener = null;

    var stop = function () {
      if (activeVideo && endedListener) {
        activeVideo.removeEventListener("ended", endedListener);
        endedListener = null;
      }
    };

    return {
      // randomStart is only safe when there's no transition animation to
      // mask a loading gap (i.e. the very first video on page load). Mid-
      // transition switches always start at 0, which is the one part of
      // the file guaranteed to already be buffered, so playback never
      // shows a frozen frame while the glitch is running on top of it.
      start: function (video, onCycleEnd, randomStart) {
        stop();
        activeVideo = video;
        video.pause();
        var seekAndPlay = function () {
          var duration = video.duration;
          if (randomStart && duration && isFinite(duration)) {
            video.currentTime = Math.random() * duration * 0.8;
          }
          video.play().catch(function () {});
          if (onCycleEnd) {
            endedListener = onCycleEnd;
            video.addEventListener("ended", endedListener, { once: true });
          }
        };
        if (video.readyState >= 1) {
          seekAndPlay();
        } else {
          video.addEventListener("loadedmetadata", seekAndPlay, { once: true });
        }
      },
      stop: stop
    };
  })();

  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    var videoPool = window.HERO_VIDEOS || [];
    if (videoPool.length) {
      var chosen = videoPool[Math.floor(Math.random() * videoPool.length)];
      heroVideo.src = chosen.file || chosen;
      window.heroVideoPlayer.start(heroVideo, function () {
        if (window.switchVideo) window.switchVideo();
      }, true);
    }
  }

  var printVariants = document.querySelector(".print-variants");
  if (printVariants) {
    var variantButtons = Array.prototype.slice.call(printVariants.querySelectorAll(".variant-option"));
    var addToCartBtn = document.getElementById("add-to-cart-btn");
    var checkoutNote = document.querySelector(".print-checkout-note");
    var printSlug = printVariants.getAttribute("data-print-slug");
    var printName = printVariants.getAttribute("data-print-name");
    var printImage = printVariants.getAttribute("data-print-image");
    var selectedVariant = null;
    var addToCartResetTimer = null;

    var selectVariant = function (btn) {
      variantButtons.forEach(function (b) {
        b.classList.remove("is-selected");
      });
      btn.classList.add("is-selected");
      selectedVariant = {
        label: btn.getAttribute("data-label"),
        price: parseFloat(btn.getAttribute("data-price")),
      };
      if (addToCartBtn) {
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = "Add to Cart";
      }
      if (checkoutNote) checkoutNote.style.display = "none";
    };

    variantButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectVariant(btn);
      });
    });

    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", function () {
        if (!selectedVariant) return;
        addToCart({
          slug: printSlug,
          name: printName,
          variantLabel: selectedVariant.label,
          price: selectedVariant.price,
          image: printImage,
        });
        addToCartBtn.textContent = "Added ✓";
        clearTimeout(addToCartResetTimer);
        addToCartResetTimer = setTimeout(function () {
          addToCartBtn.textContent = "Add to Cart";
        }, 1400);
      });
    }

    var availableVariants = variantButtons.filter(function (b) {
      return !b.disabled;
    });
    if (availableVariants.length === 1) {
      selectVariant(availableVariants[0]);
    } else if (!availableVariants.length) {
      if (addToCartBtn) addToCartBtn.style.display = "none";
      if (checkoutNote) {
        checkoutNote.textContent = "This print is sold out.";
        checkoutNote.style.display = "block";
      }
    }
  }

  var cartItemsEl = document.getElementById("cart-items");
  if (cartItemsEl) {
    var cartEmptyMsg = document.getElementById("cart-empty-message");
    var cartCheckoutEl = document.getElementById("cart-checkout");
    var cartTotalEl = document.getElementById("cart-total");
    var cartPayPalContainer = document.getElementById("paypal-button-container");
    var cartNote = document.getElementById("cart-note");

    var renderCart = function () {
      var cart = getCart();
      cartItemsEl.innerHTML = "";

      if (!cart.length) {
        if (cartEmptyMsg) cartEmptyMsg.style.display = "block";
        if (cartCheckoutEl) cartCheckoutEl.style.display = "none";
        return;
      }

      if (cartEmptyMsg) cartEmptyMsg.style.display = "none";
      if (cartCheckoutEl) cartCheckoutEl.style.display = "block";

      var total = 0;
      cart.forEach(function (item, index) {
        total += item.price * item.quantity;

        var row = document.createElement("div");
        row.className = "cart-item";

        var thumb = document.createElement("div");
        thumb.className = "cart-item-image";
        if (item.image) thumb.style.backgroundImage = "url('" + item.image + "')";

        var info = document.createElement("div");
        info.className = "cart-item-info";
        var nameEl = document.createElement("div");
        nameEl.className = "cart-item-name";
        nameEl.textContent = item.name;
        var variantEl = document.createElement("div");
        variantEl.className = "cart-item-variant";
        variantEl.textContent = item.variantLabel;
        var qtyEl = document.createElement("div");
        qtyEl.className = "cart-item-qty";
        qtyEl.textContent = "Qty: " + item.quantity;
        info.appendChild(nameEl);
        info.appendChild(variantEl);
        info.appendChild(qtyEl);

        var priceEl = document.createElement("div");
        priceEl.className = "cart-item-price";
        priceEl.textContent = "$" + (item.price * item.quantity).toFixed(2);

        var removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "cart-item-remove";
        removeBtn.setAttribute("aria-label", "Remove");
        removeBtn.textContent = "×";
        removeBtn.addEventListener("click", function () {
          removeFromCart(index);
          renderCart();
        });

        row.appendChild(thumb);
        row.appendChild(info);
        row.appendChild(priceEl);
        row.appendChild(removeBtn);
        cartItemsEl.appendChild(row);
      });

      if (cartTotalEl) cartTotalEl.textContent = "$" + total.toFixed(2);

      if (window.paypal && cartPayPalContainer) {
        cartPayPalContainer.innerHTML = "";
        window.paypal
          .Buttons({
            style: { layout: "horizontal", color: "black", shape: "rect", label: "pay" },
            createOrder: function (data, actions) {
              var currentCart = getCart();
              var items = currentCart.map(function (item) {
                return {
                  name: item.name + " (" + item.variantLabel + ")",
                  unit_amount: { currency_code: "USD", value: item.price.toFixed(2) },
                  quantity: String(item.quantity),
                };
              });
              var itemTotal = currentCart.reduce(function (sum, item) {
                return sum + item.price * item.quantity;
              }, 0);
              return actions.order.create({
                purchase_units: [
                  {
                    items: items,
                    amount: {
                      value: itemTotal.toFixed(2),
                      breakdown: { item_total: { currency_code: "USD", value: itemTotal.toFixed(2) } },
                    },
                  },
                ],
                application_context: { shipping_preference: "GET_FROM_FILE" },
              });
            },
            onApprove: function (data, actions) {
              return actions.order.capture().then(function () {
                saveCart([]);
                renderCart();
                if (cartNote) {
                  cartNote.textContent = "Thanks — your order is confirmed! It'll ship soon.";
                  cartNote.style.display = "block";
                }
              });
            },
          })
          .render(cartPayPalContainer);
      }
    };

    renderCart();
  }

  var GLITCH_CHARS = "$&#%@!<>[]{}=+*^?/\\_~";

  function TextScramble(el, glitchProbability, onComplete) {
    this.el = el;
    this.frame = 0;
    this.frameRequest = null;
    this.queue = [];
    this.spans = [];
    this.glitchProbability = typeof glitchProbability === "number" ? glitchProbability : 0.3;
    this.onComplete = onComplete;
    this.update = this.update.bind(this);
  }

  TextScramble.prototype.setText = function (newText, staggerFrames) {
    this.el.innerHTML = "";
    this.queue = [];
    this.spans = [];
    var words = newText.split(" ");
    for (var w = 0; w < words.length; w++) {
      var wordSpan = document.createElement("span");
      wordSpan.className = "scramble-word";
      for (var j = 0; j < words[w].length; j++) {
        var to = words[w][j];
        var span = document.createElement("span");
        span.className = "scramble-slot";
        span.textContent = to;
        wordSpan.appendChild(span);
        this.spans.push(span);
        var start = Math.floor((this.spans.length / newText.length) * staggerFrames);
        var end = start + 10 + Math.floor(Math.random() * 12);
        this.queue.push({ to: to, start: start, end: end, char: null });
      }
      this.el.appendChild(wordSpan);
      if (w < words.length - 1) {
        this.el.appendChild(document.createTextNode(" "));
      }
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
  };

  TextScramble.prototype.update = function () {
    var complete = 0;
    for (var i = 0; i < this.queue.length; i++) {
      var item = this.queue[i];
      var span = this.spans[i];
      if (this.frame >= item.end) {
        complete++;
        if (span.classList.contains("is-glitching")) {
          span.textContent = item.to;
          span.classList.remove("is-glitching");
        }
        span.classList.add("is-visible");
      } else if (this.frame >= item.start) {
        span.classList.add("is-visible");
        span.classList.add("is-glitching");
        if (item.to !== " " && (!item.char || Math.random() < this.glitchProbability)) {
          item.char = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          span.textContent = item.char;
        }
      }
    }
    if (complete < this.queue.length) {
      this.frame++;
      this.frameRequest = requestAnimationFrame(this.update);
    } else if (this.onComplete) {
      this.onComplete();
    }
  };

  document.querySelectorAll(".scramble-target:not(.project-scramble)").forEach(function (target) {
    var hiddenText = target.nextElementSibling;
    if (!hiddenText) return;
    var fullText = hiddenText.textContent.trim();
    var onComplete = null;
    if (hiddenText.id === "home-title" && fullText.slice(-3) === "...") {
      onComplete = function () {
        var slots = target.querySelectorAll(".scramble-slot");
        var dots = Array.prototype.slice.call(slots, -3);
        dots.forEach(function (dot) {
          dot.classList.add("loading-dot");
          dot.style.setProperty("--glitch-duration", 3600 + Math.random() * 2600 + "ms");
          dot.style.setProperty("--glitch-delay", Math.random() * 3000 + "ms");
        });
      };
    }
    var scrambler = new TextScramble(target, undefined, onComplete);
    var stagger = Math.min(fullText.length * 1.35, 95);
    scrambler.setText(fullText, stagger);
  });

  var projectsScroll = document.querySelector(".projects-scroll");
  if (projectsScroll) {
    var projectPanels = Array.prototype.slice.call(projectsScroll.querySelectorAll(".project-panel"));
    var indexLinks = document.querySelectorAll(".project-index-link");

    var runScramble = function (target) {
      var hiddenText = target.nextElementSibling;
      if (!hiddenText) return;
      var fullText = hiddenText.textContent.trim();
      var stagger = Math.min(fullText.length * 1.35, 95);
      target._scrambler = target._scrambler || new TextScramble(target, 0.08);
      target._scrambler.setText(fullText, stagger);
    };

    var randomTitleColor = function () {
      var hue = Math.floor(Math.random() * 360);
      return "hsl(" + hue + ", 95%, 58%)";
    };

    projectPanels.forEach(function (panel) {
      var slug = panel.id;
      var entry = {};
      var titleEl = panel.querySelector(".project-panel-overlay h3");
      if (titleEl) titleEl.style.color = randomTitleColor();
      var titleTarget = panel.querySelector(".project-panel-overlay h3 .scramble-target");
      var captionTarget = panel.querySelector(".project-panel-overlay p .scramble-target");
      var linkTarget = document.querySelector('.project-index-link[href="#' + slug + '"] .scramble-target');
      if (titleTarget) entry.title = titleTarget;
      if (captionTarget) entry.caption = captionTarget;
      if (linkTarget) runScramble(linkTarget);
      panel._scrambleEntry = entry;
    });

    indexLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        if (!href || href.charAt(0) !== "#") return;
        var target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "auto", block: "start" });
      });
    });

    var currentActiveSlug = null;
    var setActivePanel = function (slug, panel) {
      if (slug === currentActiveSlug) return;
      currentActiveSlug = slug;
      indexLinks.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + slug);
      });
      var entry = panel && panel._scrambleEntry;
      if (!entry) return;
      if (entry.title) runScramble(entry.title);
      if (entry.caption) runScramble(entry.caption);
    };

    var isStackedLayout = window.matchMedia("(max-width: 860px)").matches;

    var panelObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActivePanel(entry.target.id, entry.target);
          }
        });
      },
      { root: isStackedLayout ? null : projectsScroll, threshold: 0.6 }
    );

    projectPanels.forEach(function (panel) {
      panelObserver.observe(panel);
      panel.addEventListener("click", function (e) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        var href = panel.href;
        if (window.triggerCursorPush) window.triggerCursorPush();
        document.body.classList.add("page-fade-out");
        setTimeout(function () {
          window.location.href = href;
        }, 420);
      });
    });
  }

  var thumbButtonList = Array.prototype.slice.call(document.querySelectorAll(".thumb-button"));
  if (thumbButtonList.length) {
    var thumbPrev = document.querySelector(".thumb-click-prev");
    var thumbNext = document.querySelector(".thumb-click-next");

    var positionThumbNavArrows = function () {
      if (!thumbPrev || !thumbNext) return;
      var activePanel = document.querySelector(".thumb-panel.is-active");
      if (!activePanel) return;
      var media = activePanel.querySelector(".thumb-panel-media img, .thumb-panel-media video");
      if (!media) return;
      var rect = media.getBoundingClientRect();
      if (!rect.width) return;

      var gap = 8;
      var minWidth = 40;
      var sidebarWidth = 190;

      var prevWidth = Math.max(minWidth, rect.left - gap - sidebarWidth);
      var nextWidth = Math.max(minWidth, window.innerWidth - rect.right - gap);

      thumbPrev.style.width = prevWidth + "px";
      thumbNext.style.width = nextWidth + "px";
    };

    var updateThumbNavArrows = function () {
      var activeIndex = thumbButtonList.indexOf(document.querySelector(".thumb-button.is-active"));
      if (thumbPrev) thumbPrev.classList.toggle("is-disabled", activeIndex <= 0);
      if (thumbNext) thumbNext.classList.toggle("is-disabled", activeIndex === -1 || activeIndex >= thumbButtonList.length - 1);
      positionThumbNavArrows();
    };

    var activateThumb = function (thumb) {
      if (thumb.classList.contains("is-active")) return;
      var targetId = thumb.getAttribute("data-target");
      var targetPanel = document.getElementById(targetId);
      if (!targetPanel) return;

      document.querySelectorAll(".thumb-button.is-active").forEach(function (el) {
        el.classList.remove("is-active");
      });
      document.querySelectorAll(".thumb-panel.is-active").forEach(function (el) {
        el.classList.remove("is-active");
        el.querySelectorAll("video").forEach(function (video) {
          video.pause();
        });
      });

      thumb.classList.add("is-active");
      targetPanel.classList.add("is-active");
      targetPanel.querySelectorAll("video").forEach(function (video) {
        video.currentTime = 0;
        video.play().catch(function () {});
      });
      updateThumbNavArrows();

      var newMedia = targetPanel.querySelector(".thumb-panel-media img");
      if (newMedia && !newMedia.complete) {
        newMedia.addEventListener("load", positionThumbNavArrows, { once: true });
      }
    };

    thumbButtonList.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        activateThumb(thumb);
      });
    });

    if (thumbButtonList.length < 2) {
      if (thumbPrev) thumbPrev.style.display = "none";
      if (thumbNext) thumbNext.style.display = "none";
    } else {
      if (thumbPrev) {
        thumbPrev.addEventListener("click", function () {
          var activeIndex = thumbButtonList.indexOf(document.querySelector(".thumb-button.is-active"));
          if (activeIndex > 0) activateThumb(thumbButtonList[activeIndex - 1]);
          if (window.triggerCursorPush) window.triggerCursorPush();
        });
      }
      if (thumbNext) {
        thumbNext.addEventListener("click", function () {
          var activeIndex = thumbButtonList.indexOf(document.querySelector(".thumb-button.is-active"));
          if (activeIndex !== -1 && activeIndex < thumbButtonList.length - 1) activateThumb(thumbButtonList[activeIndex + 1]);
          if (window.triggerCursorPush) window.triggerCursorPush();
        });
      }
      updateThumbNavArrows();

      var thumbResizeTimer = null;
      window.addEventListener("resize", function () {
        clearTimeout(thumbResizeTimer);
        thumbResizeTimer = setTimeout(positionThumbNavArrows, 150);
      });
      window.addEventListener("load", positionThumbNavArrows);
    }
  }
});
