/* SIVYIS Corp — scroll craft (GSAP + ScrollTrigger) */
(function () {
  "use strict";

  /* Giving-back pledge: change this one value */
  var GIVING_PERCENT = 5;
  document.querySelectorAll(".give-pct").forEach(function (e) {
    e.textContent = GIVING_PERCENT + "%";
  });

  /* Ambient starfield */
  (function sky() {
    var c = document.getElementById("sky");
    if (!c) return;
    var x = c.getContext("2d");
    var s = [];
    var W, H;
    var d = Math.min(window.devicePixelRatio || 1, 2);
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function r() {
      W = window.innerWidth;
      H = window.innerHeight;
      c.width = W * d;
      c.height = H * d;
      x.setTransform(d, 0, 0, d, 0, 0);
      s = [];
      for (var i = 0; i < Math.round((W * H) / 7000); i++) {
        s.push({
          x: Math.random() * W,
          y: Math.random() * H,
          z: Math.random() * 1.2 + 0.2,
          p: Math.random() * 6.28,
          h: [200, 320, 40, 0][i % 4],
        });
      }
    }

    function f(t) {
      x.clearRect(0, 0, W, H);
      var g = x.createRadialGradient(W * 0.75, H * 0.1, 0, W * 0.75, H * 0.1, W * 0.7);
      g.addColorStop(0, "rgba(120,60,200,.18)");
      g.addColorStop(1, "rgba(5,6,13,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
      for (var i = 0; i < s.length; i++) {
        var o = s[i];
        x.globalAlpha = 0.35 + 0.45 * Math.sin((t / 1200) * o.z + o.p) ** 2;
        x.fillStyle = "hsl(" + o.h + ",80%,85%)";
        x.beginPath();
        x.arc(o.x, (o.y - window.scrollY * 0.05 * o.z + H * 3) % H, o.z, 0, 6.28);
        x.fill();
      }
      if (!reduce) requestAnimationFrame(f);
    }

    r();
    window.addEventListener("resize", r);
    requestAnimationFrame(f);
  })();

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) document.querySelectorAll(".cl animate").forEach(function (a) { a.remove(); });

  /* Handoff sits on the Cycles → Branches seam: shifting wash + textile glow. */
  var handoff = document.querySelector(".handoff");
  function placeHandoff() {
    var mood = document.querySelector(".mood");
    var cyc = document.getElementById("cycles");
    if (!handoff || !mood || !cyc) return;
    var vh = window.innerHeight || 800;
    handoff.style.height = Math.round(vh * 1.85) + "px";
    handoff.style.top = Math.max(0, cyc.offsetTop + cyc.offsetHeight - Math.round(vh * 1.05)) + "px";
  }
  placeHandoff();
  window.addEventListener("resize", placeHandoff);

  if (reduce || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    var stack = document.querySelectorAll(".story-word");
    if (stack.length) {
      stack.forEach(function (el, i) {
        el.style.opacity = i === stack.length - 1 ? "1" : "0";
        el.style.transform = "none";
      });
    }
    var expand = document.querySelector(".mask-expand");
    if (expand) expand.style.transform = "scale(1)";
    var mark = document.querySelector(".mask-mark");
    if (mark) mark.style.opacity = "0";
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Pinned diamond mask — small → full viewport */
  var expand = document.querySelector(".mask-expand");
  var maskMark = document.querySelector(".mask-mark");
  if (expand) {
    gsap.set(expand, { scale: 0.055, force3D: false });
    var maskTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".mask-section",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        pin: ".mask-sticky",
        anticipatePin: 1,
      },
    });
    /* Diamond grows past every corner: full-screen takeover */
    maskTl.to(expand, { scale: 2.4, ease: "power1.in", duration: 1, force3D: false }, 0);
    if (maskMark) {
      maskTl.to(maskMark, { opacity: 0, duration: 0.25, ease: "none" }, 0.45);
    }
    /* Fractal slants dive (self-similar diamonds + diagonal bands) */
    maskTl.fromTo(".mask-frac", { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.35 }, 0.55);
    maskTl.fromTo(".mf-tree", { scale: 0.6, rotation: 0 }, { scale: 9, rotation: 90, ease: "power1.in", duration: 1.1, svgOrigin: "500 500" }, 0.55);
    maskTl.fromTo(".mf-bands", { xPercent: 0 }, { xPercent: -24, ease: "none", duration: 1.1 }, 0.55);
    /* Glide out: fade the field to page bg so the word scrub fades in under it */
    maskTl.to(expand, { opacity: 0, ease: "power1.inOut", duration: 0.35 }, 1.35);
  }

  /* Word scrub — Everything / moves / in / cycles. */
  var wordEls = gsap.utils.toArray(".story-word");
  var pin = document.querySelector(".story-pin");
  if (wordEls.length && pin) {
    gsap.set(wordEls, { opacity: 0, scale: 0.78, y: 28 });
    gsap.set(wordEls[0], { opacity: 1, scale: 1, y: 0 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".story-scrub",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.0,
        pin: pin,
        anticipatePin: 1,
      },
    });

    wordEls.forEach(function (el, i) {
      if (i === 0) {
        tl.fromTo(
          el,
          { scale: 0.72, opacity: 0.15, y: 40 },
          { scale: 1, opacity: 1, y: 0, duration: 1, ease: "none" },
          0
        );
        return;
      }
      var prev = wordEls[i - 1];
      tl.to(prev, { opacity: 0, scale: 1.18, y: -36, duration: 0.55, ease: "none" });
      tl.fromTo(
        el,
        { opacity: 0, scale: 0.72, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "none" },
        "<0.12"
      );
    });

    tl.to(wordEls[wordEls.length - 1], {
      opacity: 0,
      scale: 1.2,
      y: -16,
      duration: 0.5,
      ease: "none",
    });
  }

  /* Soft scrubbed handoffs between content sections */
  gsap.utils.toArray(".mood > section > .wrap").forEach(function (w, i, all) {
    gsap.fromTo(w, { opacity: 0.15, y: 60, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, ease: "none",
      scrollTrigger: { trigger: w.parentNode, start: "top bottom", end: "top 55%", scrub: 1.2 } });
    if (i < all.length - 1) {
      gsap.to(w, { opacity: 0.2, y: -50, scale: 0.98, ease: "none", immediateRender: false,
        scrollTrigger: { trigger: w.parentNode, start: "bottom 45%", end: "bottom top", scrub: 1.2 } });
    }
  });

  /* Cycles: expanding rings — one continuous scrubbed progress drives
     scale, rotation and the coil together.
     Coil stays the restored circle: radius 30%, about 3.5 turns (k * 0.55).
     Scale tops out while the outermost wavy ring (r≈381/1000) plus that coil
     still sits inside the viewport, so each ring reads as a full circle.
     A small drift keeps the tunnel breathing without shoving rings off-screen. */
  var cr = document.querySelector(".cyc-rings");
  if (cr) {
    var setR = gsap.quickSetter(cr, "css");
    var frac = document.querySelector(".cf");
    var layers = gsap.utils.toArray(".cl.cr");
    var nL = layers.length;
    var spir = gsap.utils.toArray(".cl.cs");
    var prog = { p: 0 };
    var stick = document.querySelector(".cyc-stick");
    var apply = function () {
      var p = prog.p;
      var sc = 0.28 * Math.pow(0.86 / 0.28, p);
      var d = 1.4 * p;
      /* Spiral opening: large circular helix into depth, unwinding into a straight tunnel */
      var u = Math.max(0, 1 - p / 0.9); u = u * u * (3 - 2 * u);
      /* While Cycles is still rising into view, nudge the coil up only as far as
         the section allows and hide it if a ring would still be sliced by the
         viewport. Once the section is pinned or leaving, let the full circles
         scroll upward on their own. */
      var yShift = 0;
      var fade = 1;
      if (stick) {
        var br = stick.getBoundingClientRect();
        var vh = window.innerHeight || 800;
        var vmin = Math.min(window.innerWidth || vh, vh);
        var helix = 30 * (0.28 + 0.72 * u);
        var radPx = vmin * sc * (helix + 48) / 100 + 16;
        var cy = br.top + br.height / 2;
        if (br.top > 1) {
          var margin = 28;
          var header = 72;
          var overflowBot = (cy + radPx) - (vh - margin);
          if (overflowBot > 8) {
            var maxUp = cy - radPx - Math.max(br.top, header);
            var shift = Math.min(overflowBot, Math.max(0, maxUp));
            yShift = -shift;
            var still = overflowBot - shift;
            fade = still > 6 ? 0 : 1;
          }
        }
      }
      cr.style.opacity = fade.toFixed(3);
      setR({ scale: sc, rotation: 330 * p, rotationX: 22 - 14 * p, rotationY: -12 + 20 * p, xPercent: d, yPercent: d * 0.55, y: yShift, force3D: true });
      for (var k = 0; k < nL; k++) {
        /* Big coil-circle: equal large radius, more angular travel = longer helix path */
        var a = k * 0.55 + p * 3.2, rad = 30 * (0.28 + 0.72 * u);
        layers[k].style.translate = (Math.cos(a) * rad).toFixed(2) + "% " + (Math.sin(a) * rad).toFixed(2) + "% " + ((nL / 2 - k) * (12 + 14 * u)).toFixed(1) + "px";
      }
      if (spir) spir.forEach(function (el, i) { el.style.opacity = (0.35 + 0.65 * u).toFixed(3); });
      if (frac) frac.style.opacity = Math.min(1, Math.max(0, (p - 0.6) / 0.25));
    };
    apply();
    gsap.to(prog, { p: 1, ease: "none", onUpdate: apply,
      scrollTrigger: { trigger: "#cycles", start: "top 85%", end: "bottom bottom", scrub: 1.4 } });
  }

  /* Seam: background hue shifts, then the mirror-textile glow takes the handoff.
     Rings themselves are not faded here — they leave by scrolling up. */
  if (handoff) {
    var washB = handoff.querySelector(".wash-b");
    var washC = handoff.querySelector(".wash-c");
    var setH = gsap.quickSetter(handoff, "opacity");
    var setB = washB ? gsap.quickSetter(washB, "opacity") : null;
    var setC = washC ? gsap.quickSetter(washC, "opacity") : null;
    ScrollTrigger.create({
      trigger: "#cycles",
      start: "bottom 108%",
      endTrigger: "#branches",
      end: "22% top",
      scrub: 1.2,
      onRefresh: placeHandoff,
      onUpdate: function (self) {
        var p = self.progress;
        /* Rise while the circles are still on screen, hold across the seam, then ease out. */
        var env = p < 0.1 ? p / 0.1 : p < 0.34 ? 1 : p < 0.68 ? 1 - (p - 0.34) / 0.34 : 0;
        setH(env);
        if (setB) setB(Math.min(1, Math.max(0, (p - 0.04) / 0.34)));
        if (setC) setC(Math.min(1, Math.max(0, (p - 0.28) / 0.36)));
      }
    });
    ScrollTrigger.addEventListener("refreshInit", placeHandoff);
  }
  gsap.utils.toArray(".cyc li").forEach(function (el, i) {
    gsap.fromTo(el, { y: 90, x: (i % 2 ? 40 : -40), scale: 0.82, opacity: 0 }, {
      y: 0, x: 0, scale: 1, opacity: 1, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 95%", end: "top 62%", scrub: 0.5 },
    });
    ScrollTrigger.create({ trigger: el, start: "top 60%", end: "bottom 40%", toggleClass: "on" });
  });

  /* Section / card entrance */
  gsap.utils.toArray(".card, .svc div, .facts").forEach(function (el, i) {
    gsap.from(el, {
      y: 36,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      delay: (i % 4) * 0.05,
      scrollTrigger: {
        trigger: el,
        start: "top 92%",
        toggleActions: "play none none none",
      },
    });
  });

  gsap.utils.toArray(".rise-block").forEach(function (block) {
    gsap.from(block, {
      y: 44,
      opacity: 0.12,
      duration: 0.85,
      ease: "power2.out",
      scrollTrigger: {
        trigger: block,
        start: "top 78%",
        toggleActions: "play none none reverse",
      },
    });
  });

  /* Soft hero fade as you leave */
  var heroTxt = document.querySelector(".hero .txt");
  if (heroTxt) {
    gsap.to(heroTxt, {
      opacity: 0.15,
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "center top",
        end: "bottom top",
        scrub: true,
      },
    });
  }
  var cue = document.querySelector(".scroll-cue");
  if (cue) {
    gsap.to(cue, {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "30% top",
        scrub: true,
      },
    });
  }
})();
