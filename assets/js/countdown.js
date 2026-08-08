/* ==================================================================
   ROWAN & AHMED — ENGAGEMENT INVITATION
   countdown.js — Bulletproof cross-browser countdown + confetti
   ================================================================== */

(function () {
    "use strict";

    /* ---------------------------------------------------------------
       CONFIG
    --------------------------------------------------------------- */
    // iOS/Safari-safe target date — numeric constructor only.
    // new Date(year, monthIndex, day, hours, minutes, seconds)
    // August 11, 2026, 9:30 PM → monthIndex is 0-based, so August = 7
    var TARGET_DATE = new Date(2026, 7, 11, 21, 30, 0);

    var CONFETTI_COLORS = ["#D4AF37", "#E8DCC4", "#FDFBF7", "#C9A227", "#F3E9D2"];
    var CONFETTI_COUNT = 60;
    var CONFETTI_LOOP_MS = 8500; // refresh burst every 8.5s

    var confettiContainer = null;
    var confettiIntervalId = null;
    var countdownIntervalId = null;
    var hasArrived = false;

    /* ---------------------------------------------------------------
       INIT
    --------------------------------------------------------------- */
    document.addEventListener("DOMContentLoaded", initCountdown);

    function initCountdown() {
        var countdownEl = document.getElementById("countdown");
        var messageEl = document.getElementById("countdown-message");

        if (!countdownEl) return;

        var daysEl = document.getElementById("cd-days");
        var hoursEl = document.getElementById("cd-hours");
        var minutesEl = document.getElementById("cd-minutes");
        var secondsEl = document.getElementById("cd-seconds");

        // Guard: numeric constructor should never fail, but check anyway
        if (isNaN(TARGET_DATE.getTime())) {
            console.warn("Countdown: TARGET_DATE failed to construct. - countdown.js:44");
            return;
        }

        function tick() {
            var now = new Date();
            var distance = TARGET_DATE.getTime() - now.getTime();

            if (distance <= 0) {
                enterEngagementMode(countdownEl, messageEl);
                return;
            }

            var totalSeconds = Math.floor(distance / 1000);
            var days = Math.floor(totalSeconds / 86400);
            var hours = Math.floor((totalSeconds % 86400) / 3600);
            var minutes = Math.floor((totalSeconds % 3600) / 60);
            var seconds = totalSeconds % 60;

            setValue(daysEl, days);
            setValue(hoursEl, hours);
            setValue(minutesEl, minutes);
            setValue(secondsEl, seconds);
        }

        function setValue(el, value) {
            if (!el) return;
            var padded = String(value).padStart(2, "0");
            if (el.textContent !== padded) {
                el.textContent = padded;
            }
        }

        // Run immediately, then every second
        tick();
        countdownIntervalId = setInterval(tick, 1000);
    }

    /* ---------------------------------------------------------------
       ENGAGEMENT DAY MODE
    --------------------------------------------------------------- */
    function enterEngagementMode(countdownEl, messageEl) {
        if (hasArrived) return;
        hasArrived = true;

        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }

        countdownEl.classList.add("hidden");

        if (messageEl) {
            messageEl.textContent = "النهاردة خطوبتنا! 💍🎉";
            messageEl.classList.remove("hidden");
        }

        document.dispatchEvent(new CustomEvent("engagement:arrived"));

        startConfettiLoop();
    }

    /* ---------------------------------------------------------------
       CUSTOM CONFETTI EFFECT (no external libraries)
    --------------------------------------------------------------- */
    function ensureConfettiContainer() {
        if (confettiContainer) return confettiContainer;

        confettiContainer = document.createElement("div");
        confettiContainer.id = "confetti-container";
        confettiContainer.setAttribute("aria-hidden", "true");
        confettiContainer.style.position = "fixed";
        confettiContainer.style.inset = "0";
        confettiContainer.style.width = "100%";
        confettiContainer.style.height = "100%";
        confettiContainer.style.pointerEvents = "none";
        confettiContainer.style.overflow = "hidden";
        confettiContainer.style.zIndex = "99999";

        document.body.appendChild(confettiContainer);
        injectConfettiStyles();

        return confettiContainer;
    }

    function injectConfettiStyles() {
        if (document.getElementById("confetti-styles")) return;

        var style = document.createElement("style");
        style.id = "confetti-styles";
        style.textContent =
            "@keyframes confetti-fall {" +
            "0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 1; }" +
            "100% { transform: translateY(110vh) translateX(var(--drift, 0px)) rotate(var(--spin, 360deg)); opacity: 0.9; }" +
            "}" +
            ".confetti-piece {" +
            "position: absolute; top: -5vh; will-change: transform, opacity;" +
            "animation-name: confetti-fall; animation-timing-function: ease-in;" +
            "animation-fill-mode: forwards;" +
            "}";
        document.head.appendChild(style);
    }

    function createConfettiBurst() {
        var container = ensureConfettiContainer();

        for (var i = 0; i < CONFETTI_COUNT; i++) {
            var piece = document.createElement("div");
            piece.className = "confetti-piece";

            var size = 6 + Math.random() * 8; // 6–14px
            var isCircle = Math.random() > 0.5;
            var color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
            var startLeft = Math.random() * 100; // vw
            var drift = (Math.random() * 160 - 80) + "px"; // -80px to 80px horizontal drift
            var spin = (360 * (2 + Math.random() * 3)) + "deg"; // 720–1800deg
            var duration = 4 + Math.random() * 3; // 4–7s fall
            var delay = Math.random() * 1.2; // slight stagger

            piece.style.left = startLeft + "vw";
            piece.style.width = size + "px";
            piece.style.height = (isCircle ? size : size * 0.4) + "px";
            piece.style.backgroundColor = color;
            piece.style.borderRadius = isCircle ? "50%" : "2px";
            piece.style.opacity = "0";
            piece.style.setProperty("--drift", drift);
            piece.style.setProperty("--spin", spin);
            piece.style.animationDuration = duration + "s";
            piece.style.animationDelay = delay + "s";
            piece.style.boxShadow = "0 0 4px rgba(212, 175, 55, 0.35)";

            container.appendChild(piece);

            // Clean up each piece after its animation finishes
            (function (el, totalLife) {
                setTimeout(function () {
                    if (el && el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                }, totalLife * 1000 + 200);
            })(piece, duration + delay);
        }
    }

    function startConfettiLoop() {
        // First burst immediately
        createConfettiBurst();

        // Repeat burst every 8–9 seconds to keep the celebration alive
        confettiIntervalId = setInterval(createConfettiBurst, CONFETTI_LOOP_MS);
    }
})();
