/* ==================================================================
   ROWAN & AHMED — ENGAGEMENT INVITATION
   rsvp.js — Direct WhatsApp Congratulations Dispatch
   ================================================================== */

(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", initRSVP);

    function initRSVP() {
        const form = document.getElementById("rsvp-form");
        if (!form) return;

        const nameInput = document.getElementById("guest-name");
        const messageInput = document.getElementById("guest-message");
        const statusEl = document.getElementById("rsvp-status");
        const sendGroomBtn = document.getElementById("rsvp-send-groom");
        const sendBrideBtn = document.getElementById("rsvp-send-bride");

        const groomPhone = (form.getAttribute("data-groom-phone") || "").replace(/\D/g, "");
        const bridePhone = (form.getAttribute("data-bride-phone") || "").replace(/\D/g, "");

        let lastClickedTarget = "groom"; 

        if (sendGroomBtn) {
            sendGroomBtn.addEventListener("click", () => {
                lastClickedTarget = "groom";
            });
        }
        if (sendBrideBtn) {
            sendBrideBtn.addEventListener("click", () => {
                lastClickedTarget = "bride";
            });
        }

        form.addEventListener("submit", handleSubmit);

        function handleSubmit(event) {
            event.preventDefault();
            clearStatus();

            const guestName = (nameInput?.value || "").trim();
            const guestMessage = (messageInput?.value || "").trim();

            if (!guestName) {
                showStatus("من فضلك اكتب اسمك أولاً 🌸", "error");
                nameInput?.focus();
                return;
            }

            const targetPhone = lastClickedTarget === "bride" ? bridePhone : groomPhone;

            if (!targetPhone || targetPhone === "201000000000" || targetPhone === "201000000001") {
                showStatus("عذرًا، يرجى تحديث رقم الواتساب.", "error");
                return;
            }

            const whatsappText = buildWhatsAppMessage(guestName, guestMessage);
            const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(whatsappText)}`;

            showStatus("جاري تحويلك إلى واتساب... 💌", "success");
            window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        }

        function buildWhatsAppMessage(name, message) {
            const lines = [
                "دعوة خطوبة روان & أحمد 💍",
                "",
                `الاسم: ${name}`,
            ];

            if (message) {
                lines.push(`الرسالة: ${message}`);
            }

            lines.push("", "ألف مبروك وبالتوفيق يارب ✨");

            return lines.join("\n");
        }

        function showStatus(text, type) {
            if (!statusEl) return;
            statusEl.textContent = text;
            statusEl.classList.remove("success", "error");
            statusEl.classList.add(type);
        }

        function clearStatus() {
            if (!statusEl) return;
            statusEl.textContent = "";
            statusEl.classList.remove("success", "error");
        }
    }
})();