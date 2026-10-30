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

  /* Cycles: wavy-circle spiral rendered in ONE <canvas> by ONE rAF loop.
     Scroll is read once per frame and eased (no scroll-handler work, no SVG
     style writes). Same motion as before: exponential zoom, center drifting to
     the bottom-right, coil translate + depth, per-ring spin + breathing,
     colorful → SIVYIS blue shift, fade to ~30%. Tube look = shadow stroke +
     body stroke + offset highlight stroke. Depth = size + alpha (no blur). */
  var cr = document.querySelector(".cyc-rings");
  var stick = document.querySelector(".cyc-stick");
  var cycSec = document.getElementById("cycles");
  if (cr && stick && cycSec) {
    var frac = cr.querySelector(".cf");
    var ringNodes = Array.prototype.slice.call(cr.querySelectorAll(":scope > .cl"));
    var rings = ringNodes.map(function (el, i) {
      var cs = getComputedStyle(el);
      var m = (cs.getPropertyValue("--ring") || "").match(/hsl\(\s*([\d.]+)[ ,]+([\d.]+)%[ ,]+([\d.]+)%/);
      var path = el.querySelector("path");
      var nums = (path.getAttribute("d").match(/-?[\d.]+/g) || []).map(Number), rMin = 1e9, rMax = 0;
      for (var q = 0; q + 1 < nums.length; q += 2) { var rr = Math.hypot(nums[q] - 500, nums[q + 1] - 500); if (rr < rMin) rMin = rr; if (rr > rMax) rMax = rr; }
      return {
        rMin: rMin, rMax: rMax,
        spiral: el.classList.contains("cs"),
        path: new Path2D(path.getAttribute("d")),
        w: parseFloat(path.getAttribute("stroke-width")) || 1.2,
        a: (parseFloat(path.getAttribute("opacity")) || 1) * (el.classList.contains("cr") ? 0.72 : 1),
        spin: (el.classList.contains("rev") ? -1 : 1) * 2 * Math.PI / (parseFloat(cs.getPropertyValue("--d")) || 60),
        breath: parseFloat(cs.getPropertyValue("--b")) || 5,
        z: parseFloat(cs.getPropertyValue("--z")) || 0,
        h: m ? +m[1] : 195, s: m ? +m[2] : 90, l: m ? +m[3] : 65
      };
    });
    var nR = rings.filter(function (r) { return !r.spiral; }).length;
    var ri = 0;
    rings.forEach(function (r) {
      if (!r.spiral) r.k = ri++;
      var t = nR > 1 ? (r.k || 0) / (nR - 1) : 0;
      r.th = 191 + 31 * t; r.tl = 66 - 6 * t;
    });
    ringNodes.forEach(function (el) { el.remove(); });

    var cv = document.createElement("canvas");
    cv.className = "cyc-canvas";
    cv.setAttribute("aria-hidden", "true");
    stick.insertBefore(cv, stick.firstChild);
    var ctx = cv.getContext("2d", { alpha: true });
    var W = 0, H = 0, DPR = 1, VM = 1;
    var mobile = window.matchMedia("(max-width: 900px)").matches;
    var size = function () {
      DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      W = stick.clientWidth || window.innerWidth; H = stick.clientHeight || window.innerHeight;
      VM = Math.min(window.innerWidth, window.innerHeight);
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      cv.style.width = W + "px"; cv.style.height = H + "px";
    };
    size();
    window.addEventListener("resize", function () { mobile = window.matchMedia("(max-width: 900px)").matches; size(); });

    var target = 0, sp = 0, lastT = 0, visible = true, lastFrac = -1, lastCr = "";
    var readTarget = function () {
      var r = cycSec.getBoundingClientRect(), vh = window.innerHeight;
      var a = vh * 0.85, b = vh - r.height;   /* start "top 85%", end "bottom bottom" */
      return Math.min(1, Math.max(0, (a - r.top) / (a - b || 1)));
    };
    sp = target = readTarget();
    var PERSP = 900;

    var draw = function (now) {
      var p = sp, tSec = now / 1000;
      var sc = 0.28 * Math.pow(6 / 0.28, p);
      var u = Math.max(0, 1 - p / 0.9); u = u * u * (3 - 2 * u);
      var f = Math.min(1, Math.max(0, (p - 0.08) / 0.82)); f = f * f * (3 - 2 * f);
      var fade = 1 - 0.7 * f;
      var rot = (330 * p) * Math.PI / 180;
      var tiltX = Math.cos((22 - 14 * p) * Math.PI / 180), tiltY = Math.cos((-12 + 20 * p) * Math.PI / 180);
      /* drift: container moves by end.{x,y}% of its own size → stick center lands at bottom-right */
      var cx = W / 2 + (W / 2) * p, cy = H / 2 + (H / 2) * p;
      var unit = VM / 1000; /* svg viewBox → px at scale 1 */

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.lineJoin = "round"; ctx.lineCap = "round";
      /* draw far → near so nearer rings sit on top */
      for (var i = rings.length - 1; i >= 0; i--) {
        var R = rings[i];
        var zLocal, ox = 0, oy = 0;
        if (R.spiral) { zLocal = R.z; }
        else {
          var a = R.k * 0.55 + p * 3.2, rad = 30 * (0.28 + 0.72 * u);
          ox = Math.cos(a) * rad / 100 * VM; oy = Math.sin(a) * rad / 100 * VM;
          zLocal = (nR / 2 - R.k) * (12 + 14 * u);
        }
        var zEff = zLocal * sc;
        if (zEff > PERSP * 0.9) continue;
        var persp = PERSP / (PERSP - zEff);
        var br = 1 + 0.02 * Math.sin(tSec * 2 * Math.PI / (2 * R.breath) + i);
        var depth = R.spiral ? 0.5 : R.k / Math.max(1, nR - 1); /* 0 near … 1 far */
        var alpha = R.a * fade * (1 - 0.5 * depth) * (R.spiral ? (0.35 + 0.65 * u) : 1);
        if (alpha < 0.01) continue;
        var s = sc * persp * br * unit;
        /* place: container rotate → layer offset → spin */
        var lx = ox * sc, ly = oy * sc;
        var cr0 = Math.cos(rot), sr0 = Math.sin(rot);
        var px = cx + (lx * cr0 - ly * sr0) * persp * tiltY, py = cy + (lx * sr0 + ly * cr0) * persp * tiltX;
        var ang = rot + R.spin * tSec;
        var ca = Math.cos(ang) * s, sa = Math.sin(ang) * s;
        /* cull: ring annulus misses the viewport entirely */
        var dx = Math.max(0, Math.abs(px - W / 2) - W / 2), dy = Math.max(0, Math.abs(py - H / 2) - H / 2);
        var near = Math.hypot(dx, dy);
        var far = Math.hypot(Math.max(px, W - px), Math.max(py, H - py));
        var lw = R.w * 2.1 * s;
        if (R.rMax * s + lw < near || R.rMin * s - lw > far) continue;
        ctx.setTransform(DPR * ca * tiltY, DPR * sa * tiltX, -DPR * sa * tiltY, DPR * ca * tiltX, DPR * px, DPR * py);
        ctx.translate(-500, -500);
        var dh = ((R.th - R.h + 540) % 360) - 180;
        var hh = (R.h + dh * f + 360) % 360, ss = R.s + (92 - R.s) * f, ll = R.l + (R.tl - R.l) * f;
        /* tube: dark shadow/inner edge → body → offset highlight */
        ctx.globalAlpha = alpha * 0.55;
        ctx.strokeStyle = "#020510"; ctx.lineWidth = R.w * 2.1; ctx.stroke(R.path);
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = "hsl(" + hh.toFixed(1) + "," + ss.toFixed(1) + "%," + ll.toFixed(1) + "%)";
        ctx.lineWidth = R.w * 1.4; ctx.stroke(R.path);
        ctx.globalAlpha = alpha * 0.5;
        ctx.strokeStyle = "#fff"; ctx.lineWidth = R.w * 0.4;
        ctx.translate(-1.6 / (s || 1), -1.6 / (s || 1)); ctx.stroke(R.path);
      }
      ctx.globalAlpha = 1;
      /* fractal layer keeps its DOM/SVG; one transform write, only when changed */
      if (frac) {
        var fo = Math.min(1, Math.max(0, (p - 0.6) / 0.25));
        if (Math.abs(fo - lastFrac) > 0.004) { frac.style.opacity = fo.toFixed(3); lastFrac = fo; }
        var tr = fo > 0 ? "translate(" + (50 * p).toFixed(2) + "vw," + (50 * p).toFixed(2) + "vh) scale(" + sc.toFixed(4) + ") rotate(" + (330 * p).toFixed(2) + "deg)" : "scale(0.28)";
        if (tr !== lastCr) { cr.style.transform = tr; lastCr = tr; }
      }
    };

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) kick(); }, { rootMargin: "200px 0px" }).observe(cycSec);
    }
    var running = false;
    var loop = function (now) {
      if (!visible) { running = false; return; }
      var dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 0.016; lastT = now;
      target = readTarget();
      sp += (target - sp) * (1 - Math.exp(-dt / 0.12));
      if (Math.abs(target - sp) < 0.0002) sp = target;
      draw(now);
      requestAnimationFrame(loop);
    };
    var kick = function () { if (!running) { running = true; lastT = 0; requestAnimationFrame(loop); } };
    if (reduce) { draw(0); window.addEventListener("scroll", function () { sp = readTarget(); requestAnimationFrame(function () { draw(0); }); }, { passive: true }); }
    else kick();
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
