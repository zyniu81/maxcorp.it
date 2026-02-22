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
            themeBtn.textContent = "ENGAGE RETRO";
            themeBtn.setAttribute("title", "SWITCH TO CLASSIC 90S INTERFACE");
        } else {
            // SWITCH TO CLASSIC RETRO LCARS
            rootElement.setAttribute("data-theme", "retro");
            themeBtn.textContent = "RESTORE NEO";
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

    // --- 4. AUDIO SUBSYSTEM ---
    const audioToggleBtn = document.getElementById("audio-toggle");
    let isAudioEnabled = false; // DEFAULT OFF FOR UX COMPLIANCE

    // INITIALIZE AUDIO OBJECTS
    const soundToggle = new Audio("assets/audio/computerbeep_7.mp3");
    const soundRetroOn = new Audio("assets/audio/tng_viewscreen_on.mp3");
    const soundNeoOn = new Audio("assets/audio/tng_viewscreen_off.mp3");

    // SET VOLUMES TO PREVENT JUMP SCARES
    soundToggle.volume = 0.3;
    soundRetroOn.volume = 0.5;
    soundNeoOn.volume = 0.5;

    // TOGGLE GLOBAL AUDIO STATE
    audioToggleBtn.addEventListener("click", () => {
        isAudioEnabled = !isAudioEnabled;

        if (isAudioEnabled) {
            audioToggleBtn.textContent = "AUDIO ON";
            audioToggleBtn.style.backgroundColor = "var(--lcars-color-alert)";
            audioToggleBtn.setAttribute("title", "MUTE SYSTEM AUDIO");

            // PLAY CONFIRMATION BEEP
            let toggleClone = soundToggle.cloneNode();
            toggleClone.volume = 0.3;
            toggleClone.play().catch(err => console.log("AUDIO BLOCKED BY BROWSER"));
        } else {
            audioToggleBtn.textContent = "AUDIO OFF";
            audioToggleBtn.style.backgroundColor = "var(--lcars-color-3)";
            audioToggleBtn.setAttribute("title", "ENABLE SYSTEM AUDIO FEEDBACK");
        }
    });

    // ATTACH THEME-SPECIFIC SOUNDS TO THEME TOGGLE
    document.getElementById("theme-toggle").addEventListener("click", () => {
        if (!isAudioEnabled) return; // EXIT IF AUDIO IS MUTED

        // CHECK WHICH THEME WAS JUST ACTIVATED
        const currentTheme = document.documentElement.getAttribute("data-theme");

        if (currentTheme === "retro") {
            // RETRO PROTOCOL ENGAGED -> PLAY VIEWSCREEN ON
            let retroClone = soundRetroOn.cloneNode();
            retroClone.volume = 0.5;
            retroClone.play().catch(err => {});
        } else {
            // NEO PROTOCOL RESTORED -> PLAY VIEWSCREEN OFF
            let neoClone = soundNeoOn.cloneNode();
            neoClone.volume = 0.5;
            neoClone.play().catch(err => {});
        }
    });

    // --- 5. SPECIFIC BUTTON AUDIO TRIGGERS ---

    // INITIALIZE NEW AUDIO OBJECTS
    const soundAccessData = new Audio("assets/audio/computerbeep_4.mp3");
    const soundPublicRepo = new Audio("assets/audio/engage.mp3");
    const soundError = new Audio("assets/audio/computer_error.mp3");

    // PREVENT JUMP SCARES WITH PROPER VOLUME CONTROL
    soundAccessData.volume = 0.3;
    soundPublicRepo.volume = 0.5;
    soundError.volume = 0.4;

    // TARGET "ACCESS DATA" BUTTON (USING ITS TITLE ATTRIBUTE)
    const btnAccessData = document.querySelector('a[title="ACCESS PROJECT REPOSITORY"]');

    if (btnAccessData) {
        btnAccessData.addEventListener("click", () => {
            if (isAudioEnabled) {
                let accessClone = soundAccessData.cloneNode();
                accessClone.volume = 0.3;
                accessClone.play().catch(err => console.log("AUDIO BLOCKED BY BROWSER"));
            }
        });
    }

    // TARGET "PUBLIC REPOSITORY" BUTTON (USING ITS TITLE ATTRIBUTE)
    const btnPublicRepo = document.querySelector('a[title="ACCESS PUBLIC REPOSITORY"]');

    if (btnPublicRepo) {
        btnPublicRepo.addEventListener("click", () => {
            if (isAudioEnabled) {
                let repoClone = soundPublicRepo.cloneNode();
                repoClone.volume = 0.5;
                repoClone.play().catch(err => console.log("AUDIO BLOCKED BY BROWSER"));
            }
        });
    }

    // TARGET "ENCRYPTED SLOT" BUTTON (USING ITS TITLE ATTRIBUTE)
    const btnEncryptedAccess = document.querySelector('a[title="ATTEMPT ENCRYPTED ACCESS"]');

    if (btnEncryptedAccess) {
        btnEncryptedAccess.addEventListener("click", (event) => {
            // PREVENT DEFAULT LINK BEHAVIOR (AVOIDS PAGE JUMPING TO TOP)
            event.preventDefault();

            if (isAudioEnabled) {
                let errorClone = soundError.cloneNode();
                errorClone.volume = 0.4;
                errorClone.play().catch(err => console.log("AUDIO BLOCKED BY BROWSER"));
            }
        });
    }

    // INITIALIZE COMMS AUDIO OBJECTS
    const soundPrimaryComms = new Audio("assets/audio/communications_start_transmission.mp3");
    const soundSecondaryComms = new Audio("assets/audio/communications_end_transmission.mp3");

    soundPrimaryComms.volume = 0.4;
    soundSecondaryComms.volume = 0.4;

    // TARGET "PRIMARY CHANNEL" BUTTON
    const btnPrimary = document.querySelector('a[title="INITIATE PRIMARY COMMS"]');
    if (btnPrimary) {
        btnPrimary.addEventListener("click", () => {
            if (isAudioEnabled) {
                let primaryClone = soundPrimaryComms.cloneNode();
                primaryClone.volume = 0.4;
                primaryClone.play().catch(err => console.log("AUDIO BLOCKED BY BROWSER"));
            }
        });
    }

    // TARGET "SECONDARY CHANNEL" BUTTON
    const btnSecondary = document.querySelector('a[title="INITIATE SECONDARY COMMS"]');
    if (btnSecondary) {
        btnSecondary.addEventListener("click", () => {
            if (isAudioEnabled) {
                let secondaryClone = soundSecondaryComms.cloneNode();
                secondaryClone.volume = 0.4;
                secondaryClone.play().catch(err => console.log("AUDIO BLOCKED BY BROWSER"));
            }
        });
    }

});