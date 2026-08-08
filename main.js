/* ==================================================================
   ROWAN & AHMED — ENGAGEMENT INVITATION
   main.js — Preloader, Envelope + Audio, Calendar, Map, Scroll Reveal
   ================================================================== */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", () => {
        initEnvelopeAndAudio();
        initMusicToggle();
        initCalendarButtons();
        initMap();
        initScrollReveal();
        initEngagementArrivedEffect();
    });

    /* ---------------------------------------------------------------
       1. PRELOADER (pure CSS handles the pulse + auto-exit animation;
          here we just make sure it's removed from the DOM flow after
          it finishes, so it never blocks interaction/scroll).
    --------------------------------------------------------------- */
    window.addEventListener("load", () => {
        const preloader = document.getElementById("preloader");
        if (!preloader) return;
        // Matches the 0.7s exit animation that starts at 2s in animations.css
        setTimeout(() => {
            preloader.style.display = "none";
        }, 2800);
    });

    /* ---------------------------------------------------------------
       2. INTERACTIVE ENVELOPE + AUDIO UNLOCK
       Opens on click OR swipe-up. The very same user gesture that
       opens the envelope is used to call audio.play(), which is the
       cleanest way to bypass mobile autoplay restrictions (iOS/Android
       both require playback to originate from a direct user gesture).
    --------------------------------------------------------------- */
    function initEnvelopeAndAudio() {
        const envelopeGate = document.getElementById("envelope-gate");
        const envelope = document.getElementById("envelope");
        const mainContent = document.getElementById("main-content");
        const music = document.getElementById("bg-music");
        const musicToggle = document.getElementById("music-toggle");

        if (!envelopeGate || !envelope || !mainContent) return;

        let opened = false;
        let touchStartY = 0;

        function openEnvelope() {
            if (opened) return;
            opened = true;

            envelope.classList.add("is-open");

            // Unlock & start background music from this direct user gesture
            if (music) {
                music.volume = 0.55;
                const playPromise = music.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(() => {
                        // Autoplay was blocked for some reason (e.g. silent switch
                        // handling on iOS) — fail silently, user can use the toggle.
                    });
                }
            }
            if (musicToggle) {
                musicToggle.classList.remove("hidden");
                musicToggle.setAttribute("aria-pressed", "true");
            }

            // Give the flap-opening animation a moment to play, then reveal content
            setTimeout(() => {
                envelopeGate.classList.add("gate-exit");
                mainContent.classList.remove("hidden");
                mainContent.setAttribute("aria-hidden", "false");
                mainContent.classList.add("reveal");
                document.body.style.overflow = "auto";

                // Remove the gate entirely after its fade-out transition
                setTimeout(() => {
                    envelopeGate.style.display = "none";
                }, 950);
            }, 850);
        }

        // Lock page scroll while the envelope gate is showing
        document.body.style.overflow = "hidden";

        envelope.addEventListener("click", openEnvelope);
        envelope.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openEnvelope();
            }
        });

        // Swipe-up gesture support (mobile)
        envelopeGate.addEventListener(
            "touchstart",
            (e) => {
                touchStartY = e.touches[0].clientY;
            },
            { passive: true }
        );

        envelopeGate.addEventListener(
            "touchend",
            (e) => {
                const touchEndY = e.changedTouches[0].clientY;
                const swipeDistance = touchStartY - touchEndY;
                if (swipeDistance > 40) {
                    openEnvelope();
                }
            },
            { passive: true }
        );
    }

    /* ---------------------------------------------------------------
       3. MUSIC TOGGLE BUTTON
    --------------------------------------------------------------- */
    function initMusicToggle() {
        const musicToggle = document.getElementById("music-toggle");
        const music = document.getElementById("bg-music");
        if (!musicToggle || !music) return;

        musicToggle.addEventListener("click", () => {
            if (music.paused) {
                music.play().catch(() => {});
                musicToggle.setAttribute("aria-pressed", "true");
            } else {
                music.pause();
                musicToggle.setAttribute("aria-pressed", "false");
            }
        });
    }

    /* ---------------------------------------------------------------
       4. ADD TO CALENDAR (Google + Apple/ICS)
       Event: Aug 11, 2026, 9:30 PM – 12:00 AM at Hour Garden
    --------------------------------------------------------------- */
    function initCalendarButtons() {
        const googleBtn = document.getElementById("add-google-calendar");
        const appleBtn = document.getElementById("add-apple-calendar");
        if (!googleBtn && !appleBtn) return;

        const eventDetails = {
            title: "خطوبة روان & أحمد",
            description: "يسعدنا حضوركم حفل خطوبتنا في حور جاردن",
            location: "حور جاردن - Hour Garden",
            // Local Cairo time (UTC+3): 21:30 -> 00:00 next day
            start: "20260811T183000Z", // 21:30 EEST = 18:30 UTC
            end: "20260811T210000Z",   // 00:00 EEST next day = 21:00 UTC
        };

        if (googleBtn) {
            googleBtn.addEventListener("click", () => {
                const url = buildGoogleCalendarUrl(eventDetails);
                window.open(url, "_blank", "noopener,noreferrer");
            });
        }

        if (appleBtn) {
            appleBtn.addEventListener("click", () => {
                downloadIcsFile(eventDetails);
            });
        }
    }

    function buildGoogleCalendarUrl(evt) {
        const params = new URLSearchParams({
            action: "TEMPLATE",
            text: evt.title,
            dates: `${evt.start}/${evt.end}`,
            details: evt.description,
            location: evt.location,
        });
        return `https://calendar.google.com/calendar/render?${params.toString()}`;
    }

    function downloadIcsFile(evt) {
        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Rawan & Ahmed Engagement//AR",
            "CALSCALE:GREGORIAN",
            "BEGIN:VEVENT",
            `UID:${Date.now()}@rawan-ahmed-engagement`,
            `DTSTAMP:${evt.start}`,
            `DTSTART:${evt.start}`,
            `DTEND:${evt.end}`,
            `SUMMARY:${evt.title}`,
            `DESCRIPTION:${evt.description}`,
            `LOCATION:${evt.location}`,
            "END:VEVENT",
            "END:VCALENDAR",
        ].join("\r\n");

        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "engagement-rawan-ahmed.ics";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /* ---------------------------------------------------------------
       5. LEAFLET MAP — Hour Garden with Gold Heart Marker
    --------------------------------------------------------------- */
    function initMap() {
        const mapEl = document.getElementById("map");
        if (!mapEl || typeof L === "undefined") return;

        const lat = parseFloat(mapEl.getAttribute("data-lat")) || 30.0330;
        const lng = parseFloat(mapEl.getAttribute("data-lng")) || 31.2100;

        const map = L.map("map", {
            zoomControl: true,
            scrollWheelZoom: false,
            attributionControl: true,
        }).setView([lat, lng], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);

        // Custom gold heart marker using a divIcon (SVG heart, no external image needed)
        const goldHeartIcon = L.divIcon({
            className: "gold-heart-marker",
            html: `
                <svg width="42" height="42" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21s-7.5-4.6-10.2-9.3C0.2 8.7 1.6 5 5.1 4.2c2-.5 4 .3 5.1 2 .3.4.5.8.7 1.2.2-.4.4-.8.7-1.2 1.1-1.7 3.1-2.5 5.1-2 3.5.8 4.9 4.5 3.3 7.5C19.5 16.4 12 21 12 21Z"
                          fill="#D4AF37" stroke="#A8842A" stroke-width="0.6"/>
                </svg>
            `,
            iconSize: [42, 42],
            iconAnchor: [21, 40],
            popupAnchor: [0, -38],
        });

        L.marker([lat, lng], { icon: goldHeartIcon })
            .addTo(map)
            .bindPopup(
                `<strong style="font-family:'Alexandria',sans-serif;color:#A8842A;">حور جاردن</strong><br/>Hour Garden<br/>حفل خطوبة روان &amp; أحمد`
            );

        // Re-enable scroll zoom only when the user has clicked into the map,
        // so page scrolling on mobile isn't hijacked accidentally.
        map.on("click", () => {
            map.scrollWheelZoom.enable();
        });
    }

    /* ---------------------------------------------------------------
       6. SCROLL REVEAL (IntersectionObserver)
    --------------------------------------------------------------- */
    function initScrollReveal() {
        const targets = document.querySelectorAll(".section, .hero-frame");
        if (!targets.length) return;

        if (!("IntersectionObserver" in window)) {
            targets.forEach((el) => el.classList.add("in-view"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
        );

        targets.forEach((el) => observer.observe(el));
    }

    /* ---------------------------------------------------------------
       7. OPTIONAL CELEBRATION EFFECT WHEN THE DAY ARRIVES
       Listens for the "engagement:arrived" event dispatched by
       countdown.js and adds a gentle celebratory pulse to the hero.
    --------------------------------------------------------------- */
    function initEngagementArrivedEffect() {
        document.addEventListener("engagement:arrived", () => {
            const hero = document.getElementById("hero");
            if (hero) {
                hero.style.transition = "box-shadow 1.2s ease";
                hero.style.boxShadow = "inset 0 0 120px rgba(212, 175, 55, 0.25)";
            }
        });
    }
})();
