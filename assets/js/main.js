/* ==================================================================
   ROWAN & AHMED — ENGAGEMENT INVITATION
   guestbook.js — Real-time Guestbook / Wishes Wall (Firebase RTDB)
   ================================================================== */

(function () {
    "use strict";

    /* ---------------------------------------------------------------
       1. FIREBASE CONFIG
       Replace every placeholder below with your own Firebase project
       values (Project Settings → General → Your apps → SDK config).
    --------------------------------------------------------------- */
    const firebaseConfig = {
  apiKey: "AIzaSyA2PJWCin4DjJnEYZxZ2P6-bcGYSHzPf3A",
  authDomain: "rowan-ahmed-guestbook.firebaseapp.com",
  projectId: "rowan-ahmed-guestbook",
  storageBucket: "rowan-ahmed-guestbook.firebasestorage.app",
  messagingSenderId: "1035116928604",
  appId: "1:1035116928604:web:383a5dbb92c3fdac3ad099",
  measurementId: "G-CY5TMMFQ6Y"
};

    /* ---------------------------------------------------------------
       2. CONFIG
    --------------------------------------------------------------- */
    var WISHES_PATH = "wishes";     // Realtime Database node name
    var MAX_WISHES_LOADED = 50;     // how many past wishes to load on start
    var AUTO_SCROLL_SPEED = 0.45;   // px per animation frame

    var isScrollPaused = false;
    var rafId = null;

    document.addEventListener("DOMContentLoaded", initGuestbook);

    function initGuestbook() {
        var form = document.getElementById("guestbook-form");
        var wallInner = document.getElementById("wishes-wall-inner");
        var wall = document.getElementById("wishes-wall");

        if (!form || !wallInner || !wall) return;

        if (typeof firebase === "undefined") {
            console.warn("Guestbook: Firebase SDK did not load  check the CDN script tags in index.html. - guestbook.js:44");
            showFormStatus("تعذّر الاتصال بحائط التهاني حاليًا 🙏", "error");
            return;
        }

        /* ---------------------------------------------------------------
           3. INITIALIZE FIREBASE
        --------------------------------------------------------------- */
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        var database = firebase.database();
        var wishesRef = database.ref(WISHES_PATH);

        /* ---------------------------------------------------------------
           4. SAVE A NEW WISH ON FORM SUBMIT
        --------------------------------------------------------------- */
        var nameInput = document.getElementById("wish-name");
        var messageInput = document.getElementById("wish-message");
        var submitBtn = document.getElementById("wish-submit");

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            var name = (nameInput.value || "").trim();
            var message = (messageInput.value || "").trim();

            if (!name || !message) {
                showFormStatus("من فضلك اكتبي اسمك ورسالتك 🌸", "error");
                return;
            }

            setSubmitLoading(true);

            wishesRef
                .push({
                    name: name,
                    message: message,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                })
                .then(function () {
                    showFormStatus("تم إرسال تهنئتك بنجاح 💛", "success");
                    form.reset();
                })
                .catch(function (error) {
                    console.error("Guestbook: failed to save wish. - guestbook.js:89", error);
                    showFormStatus("حصل خطأ أثناء الإرسال، حاولي تاني 🙏", "error");
                })
                .finally(function () {
                    setSubmitLoading(false);
                });
        });

        function setSubmitLoading(isLoading) {
            if (!submitBtn) return;
            submitBtn.disabled = isLoading;
            submitBtn.classList.toggle("is-loading", isLoading);
        }

        function showFormStatus(text, type) {
            var statusEl = document.getElementById("guestbook-status");
            if (!statusEl) return;
            statusEl.textContent = text;
            statusEl.classList.remove("success", "error");
            statusEl.classList.add(type);
        }

        /* ---------------------------------------------------------------
           5. LISTEN FOR NEW WISHES IN REAL TIME (onChildAdded)
              New wishes are prepended to the TOP of the wall so the
              most recent one is always seen first.
        --------------------------------------------------------------- */
        var recentWishesQuery = wishesRef.limitToLast(MAX_WISHES_LOADED);

        recentWishesQuery.on(
            "child_added",
            function (snapshot) {
                var wish = snapshot.val();
                if (!wish) return;
                renderWishCard(wallInner, wish);
            },
            function (error) {
                console.error("Guestbook: failed to read wishes. - guestbook.js:126", error);
            }
        );

        function renderWishCard(container, wish) {
            var emptyState = document.getElementById("wishes-empty");
            if (emptyState) {
                emptyState.remove();
            }

            var card = document.createElement("div");
            card.className = "wish-card wish-card-enter";

            var nameEl = document.createElement("p");
            nameEl.className = "wish-card-name";
            nameEl.textContent = wish.name || "ضيف عزيز";

            var messageEl = document.createElement("p");
            messageEl.className = "wish-card-message";
            messageEl.textContent = wish.message || "";

            card.appendChild(nameEl);
            card.appendChild(messageEl);

            // Prepend — newest wish always appears at the top
            container.insertBefore(card, container.firstChild);

            // Trigger the entrance animation on the next frame
            requestAnimationFrame(function () {
                card.classList.add("wish-card-enter-active");
            });
        }

        /* ---------------------------------------------------------------
           6. CONTINUOUS AUTO-SCROLL — pauses on hover / touch
        --------------------------------------------------------------- */
        initAutoScroll(wall);
    }

    function initAutoScroll(wall) {
        function step() {
            if (!isScrollPaused) {
                var maxScroll = wall.scrollHeight - wall.clientHeight;
                if (maxScroll > 0) {
                    wall.scrollTop += AUTO_SCROLL_SPEED;
                    if (wall.scrollTop >= maxScroll) {
                        wall.scrollTop = 0;
                    }
                }
            }
            rafId = requestAnimationFrame(step);
        }

        // Pause while the user is reading (desktop hover)
        wall.addEventListener("mouseenter", function () {
            isScrollPaused = true;
        });
        wall.addEventListener("mouseleave", function () {
            isScrollPaused = false;
        });

        // Pause on touch (mobile), resume a moment after the finger lifts
        wall.addEventListener(
            "touchstart",
            function () {
                isScrollPaused = true;
            },
            { passive: true }
        );
        wall.addEventListener(
            "touchend",
            function () {
                setTimeout(function () {
                    isScrollPaused = false;
                }, 1800);
            },
            { passive: true }
        );

        rafId = requestAnimationFrame(step);
    }
})();
