(function () {
  var NEON_COLORS = ["#ccff33", "#39ff14", "#ff2ec4", "#00e5ff", "#b026ff", "#ff6a00", "#faff00", "#ff2b5e"];
  var chosen = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
  document.documentElement.style.setProperty("--color-accent", chosen);
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

  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo) {
    var videoFiles = [
      "video_2023-11-08_14-15-30.mp4",
      "video_2026-08-14_19-19-06.mp4"
    ];
    var chosen = videoFiles[Math.floor(Math.random() * videoFiles.length)];
    heroVideo.src = "index_videos/" + chosen;
    heroVideo.play().catch(function () {});
  }

  var GLITCH_CHARS = "$&#%@!<>[]{}=+*^?/\\_~";

  function TextScramble(el) {
    this.el = el;
    this.frame = 0;
    this.frameRequest = null;
    this.queue = [];
    this.spans = [];
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
        if (item.to !== " " && (!item.char || Math.random() < 0.3)) {
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

  document.querySelectorAll(".scramble-target").forEach(function (target) {
    var hiddenText = target.nextElementSibling;
    if (!hiddenText) return;
    var fullText = hiddenText.textContent.trim();
    var scrambler = new TextScramble(target);
    var stagger = Math.min(fullText.length * 1.35, 95);
    scrambler.setText(fullText, stagger);
  });
});
