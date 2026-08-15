(function () {
  var NEON_COLORS = ["#ccff33", "#39ff14", "#ff2ec4", "#00e5ff", "#b026ff", "#ff6a00", "#faff00", "#ff2b5e"];
  var chosen = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
  document.documentElement.style.setProperty("--color-accent", chosen);
  var chosenProject = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
  document.documentElement.style.setProperty("--color-project-accent", chosenProject);
  var chosenIndex = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
  document.documentElement.style.setProperty("--color-index-accent", chosenIndex);

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

  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    var videoPool = window.HERO_VIDEOS || [];
    if (videoPool.length) {
      var chosen = videoPool[Math.floor(Math.random() * videoPool.length)];
      heroVideo.src = chosen.file || chosen;
      heroVideo.play().catch(function () {});
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

  function TextScramble(el, glitchProbability) {
    this.el = el;
    this.frame = 0;
    this.frameRequest = null;
    this.queue = [];
    this.spans = [];
    this.glitchProbability = typeof glitchProbability === "number" ? glitchProbability : 0.3;
    this.update = this.update.bind(this);
  }

  TextScramble.prototype.setText = function (newText, staggerFrames) {
    this.el.innerHTML = "";
    this.queue = [];
    this.spans = [];
    for (var i = 0; i < newText.length; i++) {
      var to = newText[i];
      var span = document.createElement("span");
      span.className = "scramble-slot";
      span.textContent = to;
      this.el.appendChild(span);
      this.spans.push(span);
      var start = Math.floor((i / newText.length) * staggerFrames);
      var end = start + 10 + Math.floor(Math.random() * 12);
      this.queue.push({ to: to, start: start, end: end, char: null });
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
    }
  };

  document.querySelectorAll(".scramble-target:not(.project-scramble)").forEach(function (target) {
    var hiddenText = target.nextElementSibling;
    if (!hiddenText) return;
    var fullText = hiddenText.textContent.trim();
    var scrambler = new TextScramble(target);
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

    projectPanels.forEach(function (panel) {
      var slug = panel.id;
      var entry = {};
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
        target.scrollIntoView({ behavior: "smooth", block: "start" });
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
        document.body.classList.add("page-fade-out");
        setTimeout(function () {
          window.location.href = href;
        }, 420);
      });
    });
  }
});
