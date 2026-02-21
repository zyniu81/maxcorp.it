/* ========================================================= */
/* MAXCORP TERMINAL CORE LOGIC                               */
/* ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // --- 1. INITIALIZATION SEQUENCE (SPLASH SCREEN) ---
    const splashScreen = document.getElementById("splash-screen");
    const mainInterface = document.getElementById("lcars-wrapper");

    // SET TIMEOUT FOR 2 SECONDS (2000 MILLISECONDS)
    setTimeout(() => {
        // FADE OUT SPLASH SCREEN
        splashScreen.style.opacity = "0";

        // WAIT FOR FADE TRANSITION TO COMPLETE BEFORE HIDING FROM DOM
        setTimeout(() => {
            splashScreen.classList.add("hidden");
            // REVEAL MAIN LCARS INTERFACE
            mainInterface.classList.remove("hidden");
        }, 500);

    }, 2000);

    // --- 2. THEME TOGGLE (NEO VS RETRO PROTOCOL) ---
    const themeBtn = document.getElementById("theme-toggle");
    const rootElement = document.documentElement; // Targets the <html> tag

    themeBtn.addEventListener("click", () => {
        // CHECK CURRENT THEME STATUS
        const currentTheme = rootElement.getAttribute("data-theme");

        if (currentTheme === "retro") {
            // SWITCH TO NEO-LCARS (DEFAULT)
            rootElement.removeAttribute("data-theme");
            themeBtn.textContent = "ENGAGE RETRO PROTOCOL";
            themeBtn.setAttribute("title", "SWITCH TO CLASSIC 90S INTERFACE");
        } else {
            // SWITCH TO CLASSIC RETRO LCARS
            rootElement.setAttribute("data-theme", "retro");
            themeBtn.textContent = "RESTORE NEO PROTOCOL";
            themeBtn.setAttribute("title", "SWITCH TO MODERN NEON INTERFACE");
        }
    });

    // --- 3. SUBSPACE COMMS (COPY TO CLIPBOARD FALLBACK) ---
    const commsButtons = document.querySelectorAll('a[href^="mailto:"]');

    commsButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            // EXTRACT EMAIL ADDRESS FROM HREF ATTRIBUTE
            const emailAddress = button.getAttribute("href").replace("mailto:", "");

            // EXECUTE CLIPBOARD WRITE OPERATION
            navigator.clipboard.writeText(emailAddress).then(() => {
                // STORE ORIGINAL TEXT TO RESTORE LATER
                const originalText = button.textContent;

                // PROVIDE VISUAL FEEDBACK TO USER
                button.textContent = "ADDRESS COPIED";
                button.style.backgroundColor = "var(--lcars-color-2)"; // HIGHLIGHT COLOR
                button.style.color = "#000"; // HIGH CONTRAST TEXT

                // RESTORE ORIGINAL BUTTON STATE AFTER 2.5 SECONDS
                setTimeout(() => {
                    button.textContent = originalText;
                    // RESET STYLES TO LET CSS REGAIN CONTROL
                    button.style.backgroundColor = "";
                    button.style.color = "";
                }, 2500);
            }).catch(err => {
                console.error("CLIPBOARD WRITE FAILED: ", err);
            });
        });
    });

});