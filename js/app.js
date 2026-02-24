/* ========================================================= */
/* MAXCORP TERMINAL CORE LOGIC - PART 1                      */
/* ========================================================= */

// =========================================================
// --- 1. GLOBAL SYSTEM STATE & AUDIO ASSETS ---
// =========================================================

// SYSTEM STATE
let isAudioEnabled = false; // DEFAULT OFF FOR UX COMPLIANCE
let isPolish = false; // DEFAULT SYSTEM LANGUAGE
const githubUsername = "zyniu81";

// INITIALIZE ALL AUDIO OBJECTS
const soundPublicRepo = new Audio("assets/audio/engage.mp3");
const soundToggle = new Audio("assets/audio/computerbeep_7.mp3");
const soundRetroOn = new Audio("assets/audio/tng_viewscreen_on.mp3");
const soundNeoOn = new Audio("assets/audio/tng_viewscreen_off.mp3");
const soundLang = new Audio("assets/audio/computerbeep_50.mp3");
const soundError = new Audio("assets/audio/computer_error.mp3");
const soundPrimaryComms = new Audio("assets/audio/communications_start_transmission.mp3");
const soundSecondaryComms = new Audio("assets/audio/communications_end_transmission.mp3");
const soundDoors = new Audio("assets/audio/tng_doors.m4a");

// CALIBRATE VOLUMES GLOBALLY (PREVENT JUMP SCARES)
soundPublicRepo.volume = 0.5;
soundToggle.volume = 0.3;
soundRetroOn.volume = 0.5;
soundNeoOn.volume = 0.5;
soundLang.volume = 0.4;
soundError.volume = 0.4;
soundPrimaryComms.volume = 0.4;
soundSecondaryComms.volume = 0.4;
soundDoors.volume = 0.5;


// =========================================================
// --- 2. MAIN SYSTEM BOOT & DOM SELECTORS ---
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    // --- CACHE DOM ELEMENTS ---
    const splashScreen = document.getElementById("splash-screen");
    const mainInterface = document.getElementById("lcars-wrapper");
    const themeBtn = document.getElementById("theme-toggle");
    const rootElement = document.documentElement;
    const audioToggleBtn = document.getElementById("audio-toggle");
    const skillsPanel = document.querySelector("#skills .panel-body");

    const commsButtons = document.querySelectorAll('a[href^="mailto:"]');
    const btnPublicRepo = document.querySelector('a[title="ACCESS PUBLIC REPOSITORY"]');
    const btnEncryptedAccess = document.querySelector('a[title="ATTEMPT ENCRYPTED ACCESS"]');
    const btnPrimary = document.querySelector('a[title="INITIATE PRIMARY COMMS"]');
    const btnSecondary = document.querySelector('a[title="INITIATE SECONDARY COMMS"]');
    const btnOpenModal = document.querySelector('a[title="ACCESS PROJECT REPOSITORY"]');

    const modalOverlay = document.getElementById("repo-modal-overlay");
    const modalScreen = document.getElementById("repo-modal-screen");
    const beamLeft = document.querySelector(".beam-left");
    const beamRight = document.querySelector(".beam-right");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const repoListContainer = document.getElementById("repo-list-container");

    // TRANSLATOR
    const langBtns = document.querySelectorAll(".lang-toggle-btn");
    const elementsEng = document.querySelectorAll(".bio-short-eng, .bio-long-eng");
    const elementsPl = document.querySelectorAll(".bio-short-pl, .bio-long-pl");

    // BIO MODAL
    const bioOverlay = document.getElementById("bio-modal-overlay");
    const bioScreen = document.getElementById("bio-modal-screen");
    const bioBeamLeft = document.querySelector(".beam-left-bio");
    const bioBeamRight = document.querySelector(".beam-right-bio");
    const openBioBtn = document.getElementById("open-bio-modal-btn");
    const closeBioBtn = document.getElementById("close-bio-modal-btn");


    // =========================================================
    // --- 3. SYSTEM FUNCTIONS ---
    // =========================================================

    // ASYNC FUNCTION TO FETCH AND RENDER REPOSITORY DATA
    async function fetchGitHubStats() {
        try {
            // CHECK LOCAL CACHE TO PREVENT API RATE LIMIT LOCKOUT (60 REQ/HR)
            const cachedData = sessionStorage.getItem("lcars_github_stats");
            if (cachedData) {
                renderSkills(JSON.parse(cachedData));
                return;
            }

            // DISPLAY SCANNING STATUS
            skillsPanel.innerHTML = "<p class='skill-row'><span class='skill-label'>SCANNING...</span></p>";

            // FETCH ALL PUBLIC REPOSITORIES
            const reposResponse = await fetch(`https://api.github.com/users/${githubUsername}/repos`);
            if (!reposResponse.ok) throw new Error("API COMMS FAILURE");
            const repos = await reposResponse.json();

            let languageTotals = {};
            let totalBytes = 0;

            // FETCH EXACT BYTE COUNTS FOR EACH REPOSITORY CONCURRENTLY
            const langPromises = repos.map(repo => fetch(repo.languages_url).then(res => res.json()));
            const langsArray = await Promise.all(langPromises);

            // AGGREGATE ALL BYTES PER LANGUAGE
            langsArray.forEach(langs => {
                for (const [lang, bytes] of Object.entries(langs)) {
                    if (!languageTotals[lang]) languageTotals[lang] = 0;
                    languageTotals[lang] += bytes;
                    totalBytes += bytes;
                }
            });

            // ABORT PROTOCOL IF NO DATA IS FOUND
            if (totalBytes === 0) {
                skillsPanel.innerHTML = "<p class='skill-row'><span class='skill-label'>NO DATA</span></p>";
                return;
            }

            // CALCULATE PERCENTAGES AND SORT DESENDING
            let stats = [];
            for (const [lang, bytes] of Object.entries(languageTotals)) {
                stats.push({
                    lang: lang,
                    percent: ((bytes / totalBytes) * 100).toFixed(1)
                });
            }
            stats.sort((a, b) => b.percent - a.percent);

            // CACHE THE RESULTS FOR THIS BROWSER SESSION
            sessionStorage.setItem("lcars_github_stats", JSON.stringify(stats));

            // RENDER THE INTERFACE
            renderSkills(stats);

        } catch (error) {
            console.error("TELEMETRY ERROR: ", error);
            skillsPanel.innerHTML = "<p class='skill-row'><span class='skill-label' " +
                "style='color: var(--lcars-color-alert);'>UPLINK FAILED</span></p>";
        }
    }

    // FUNCTION TO BUILD AND INJECT HTML NODES
    function renderSkills(stats) {
        skillsPanel.innerHTML = ""; // CLEAR PANEL

        stats.forEach(stat => {
            // FILTER OUT MICRO-LANGUAGES (UNDER 1%) TO KEEP UI CLEAN
            if (stat.percent >= 1.0) {
                const totalBlocks = 10;
                const filledBlocks = Math.round((stat.percent / 100) * totalBlocks);
                // USE NON-BREAKING SPACES (\u00A0) TO PRESERVE BAR LENGTH IN HTML
                const barString = "[" + "|".repeat(filledBlocks) + "\u00A0".repeat(totalBlocks - filledBlocks) + "]";

                const p = document.createElement("p");
                p.className = "skill-row";
                p.setAttribute("title", `${stat.lang.toUpperCase()} CAPACITY: ${stat.percent}%`);

                p.innerHTML = `
                    <span class="skill-label">${stat.lang.toUpperCase()}</span> 
                    <span class="bar-value">${barString} ${Math.round(stat.percent)}%</span>
                `;
                skillsPanel.appendChild(p);
            }
        });
    }

    // FUNCTION TO CLOSE MODAL WITH SEQUENTIAL REVERSE ANIMATIONS
    function closeRepoModal() {
        // PLAY DOOR CLOSE SOUND IMMEDIATELY
        if (isAudioEnabled) {
            let doorClone = soundDoors.cloneNode();
            doorClone.volume = 0.5;
            doorClone.play().catch(err => console.log("AUDIO BLOCKED BY BROWSER"));
        }

        // PHASE 1: FADE OUT THE SCREEN FIRST
        modalScreen.classList.remove("fade-in");

        // WAIT 400ms (CSS FADE DURATION) THEN HIDE SCREEN AND START CLOSING BEAMS
        setTimeout(() => {
            modalScreen.classList.add("hidden");

            // PHASE 2: SLIDE BEAMS BACK TO CENTER USING EXPLICIT CLASSES
            beamLeft.className = "beam-left beam-close-horizontal-left";
            beamRight.className = "beam-right beam-close-horizontal-right";

            // WAIT 500ms (CSS SLIDE DURATION) THEN SHRINK VERTICALLY
            setTimeout(() => {
                // PHASE 3: SHRINK BACK TO DOTS WITH EXPLICIT POSITIONING
                beamLeft.className = "beam-left beam-close-vertical-left";
                beamRight.className = "beam-right beam-close-vertical-right";

                // WAIT 300ms (CSS GROW DURATION) THEN HIDE OVERLAY AND CLEAN UP
                setTimeout(() => {
                    modalOverlay.classList.add("hidden");
                    beamLeft.className = "beam-left";
                    beamRight.className = "beam-right";

                    // RESET SCREEN CONTENT FOR NEXT USE
                    repoListContainer.innerHTML = '<p class="system-text blink" style="text-align:center; ' +
                        'padding: 20px;">AWAITING SENSOR DATA...</p>';
                }, 300);

            }, 500);

        }, 400);
    }


    // =========================================================
    // --- 4. EVENT LISTENERS & TRIGGERS ---
    // =========================================================

    // SPLASH SCREEN LOGIC
    if (splashScreen && mainInterface) {
        setTimeout(() => {
            splashScreen.style.opacity = "0";
            setTimeout(() => {
                splashScreen.classList.add("hidden");
                mainInterface.classList.remove("hidden");
            }, 500);
        }, 2000);
    }

    // THEME TOGGLE LOGIC
    if (themeBtn && rootElement) {
        themeBtn.addEventListener("click", () => {
            const currentTheme = rootElement.getAttribute("data-theme");

            if (currentTheme === "retro") {
                rootElement.removeAttribute("data-theme");
                themeBtn.textContent = "ENGAGE RETRO";
                themeBtn.setAttribute("title", "SWITCH TO CLASSIC 90S INTERFACE");
                if (isAudioEnabled) {
                    let neoClone = soundNeoOn.cloneNode();
                    neoClone.volume = 0.5;
                    neoClone.play().catch(err => {});
                }
            } else {
                rootElement.setAttribute("data-theme", "retro");
                themeBtn.textContent = "RESTORE NEO";
                themeBtn.setAttribute("title", "SWITCH TO MODERN NEON INTERFACE");
                if (isAudioEnabled) {
                    let retroClone = soundRetroOn.cloneNode();
                    retroClone.volume = 0.5;
                    retroClone.play().catch(err => {});
                }
            }
        });
    }

    // SUBSPACE COMMS LOGIC (COPY TO CLIPBOARD)
    if (commsButtons) {
        commsButtons.forEach(button => {
            button.addEventListener("click", (event) => {
                const emailAddress = button.getAttribute("href").replace("mailto:", "");
                navigator.clipboard.writeText(emailAddress).then(() => {
                    const originalText = button.textContent;
                    button.textContent = "ADDRESS COPIED";
                    button.style.backgroundColor = "var(--lcars-color-2)";
                    button.style.color = "#000";
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.backgroundColor = "";
                        button.style.color = "";
                    }, 2500);
                }).catch(err => console.error("CLIPBOARD WRITE FAILED: ", err));
            });
        });
    }

    // AUDIO TOGGLE LOGIC
    if (audioToggleBtn) {
        audioToggleBtn.addEventListener("click", () => {
            isAudioEnabled = !isAudioEnabled;
            if (isAudioEnabled) {
                audioToggleBtn.textContent = "AUDIO ON";
                audioToggleBtn.style.backgroundColor = "var(--lcars-color-alert)";
                audioToggleBtn.setAttribute("title", "MUTE SYSTEM AUDIO");
                let toggleClone = soundToggle.cloneNode();
                toggleClone.volume = 0.3;
                toggleClone.play().catch(err => console.log("AUDIO BLOCKED BY BROWSER"));
            } else {
                audioToggleBtn.textContent = "AUDIO OFF";
                audioToggleBtn.style.backgroundColor = "var(--lcars-color-3)";
                audioToggleBtn.setAttribute("title", "ENABLE SYSTEM AUDIO FEEDBACK");
            }
        });
    }

    // SPECIFIC BUTTON AUDIO TRIGGERS
    if (btnPublicRepo) {
        btnPublicRepo.addEventListener("click", () => {
            if (isAudioEnabled) {
                let repoClone = soundPublicRepo.cloneNode();
                repoClone.volume = 0.5;
                repoClone.play().catch(err => console.log("AUDIO BLOCKED BY BROWSER"));
            }
        });
    }

    if (btnEncryptedAccess) {
        btnEncryptedAccess.addEventListener("click", (event) => {
            event.preventDefault();
            if (isAudioEnabled) {
                let errorClone = soundError.cloneNode();
                errorClone.volume = 0.4;
                errorClone.play().catch(err => console.log("AUDIO BLOCKED BY BROWSER"));
            }
        });
    }

    if (btnPrimary) {
        btnPrimary.addEventListener("click", () => {
            if (isAudioEnabled) {
                let primaryClone = soundPrimaryComms.cloneNode();
                primaryClone.volume = 0.4;
                primaryClone.play().catch(err => console.log("AUDIO BLOCKED BY BROWSER"));
            }
        });
    }

    if (btnSecondary) {
        btnSecondary.addEventListener("click", () => {
            if (isAudioEnabled) {
                let secondaryClone = soundSecondaryComms.cloneNode();
                secondaryClone.volume = 0.4;
                secondaryClone.play().catch(err => console.log("AUDIO BLOCKED BY BROWSER"));
            }
        });
    }

    // INITIATE SCAN SEQUENCE
    if (skillsPanel) {
        fetchGitHubStats();
    }

    // REPOSITORY MODAL TRIGGER
    if (btnOpenModal) {
        btnOpenModal.addEventListener("click", (e) => {
            e.preventDefault();
            if (isAudioEnabled) {
                let doorClone = soundDoors.cloneNode();
                doorClone.volume = 0.5;
                doorClone.play().catch(err => console.log("AUDIO BLOCKED BY BROWSER"));
            }
            modalOverlay.classList.remove("hidden");
            setTimeout(() => {
                beamLeft.classList.add("beam-animate-vertical");
                beamRight.classList.add("beam-animate-vertical");
            }, 100);
            setTimeout(() => {
                beamLeft.classList.replace("beam-animate-vertical", "beam-animate-horizontal-left");
                beamRight.classList.replace("beam-animate-vertical", "beam-animate-horizontal-right");
            }, 400);
            setTimeout(() => {
                modalScreen.classList.remove("hidden");
                setTimeout(() => modalScreen.classList.add("fade-in"), 50);

                // INITIATE DATA FETCH
                loadRepositoryData();
            }, 900);
        });
    }

    // CLOSE MODAL EVENTS
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeRepoModal);
    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            if (e.target === modalOverlay || e.target.id === "repo-modal-container") {
                closeRepoModal();
            }
        });
    }

    // =========================================================
    // --- 5. SYSTEM FUNCTIONS (PART 2) ---
    // =========================================================

    // ASYNC FUNCTION TO FETCH GITHUB REPOS FOR THE MODAL
    async function loadRepositoryData() {
        try {
            // FETCH GITHUB DATA (REUSING THE USERNAME VARIABLE)
            const response = await fetch(`https://api.github.com/users/${githubUsername}/repos`);
            if (!response.ok) throw new Error("API COMMS FAILURE");
            const gitRepos = await response.json();

            // CLEAR THE "AWAITING DATA" MESSAGE
            repoListContainer.innerHTML = "";

            // RENDER EACH PROJECT INTO THE SCROLLABLE WINDOW
            gitRepos.forEach(repo => {
                // SKIP FORKED REPOS TO KEEP LIST CLEAN
                if (repo.fork) return;

                const card = document.createElement("div");
                card.style.borderLeft = "5px solid var(--lcars-color-1)";
                card.style.padding = "15px";
                card.style.backgroundColor = "rgba(0,0,0,0.5)";
                card.style.display = "flex";
                card.style.flexDirection = "column";

                const title = document.createElement("h4");
                title.className = "project-title";
                title.textContent = repo.name.toUpperCase();
                title.style.color = "var(--lcars-color-3)";

                const desc = document.createElement("p");
                desc.style.flexGrow = "1";
                desc.style.marginBottom = "15px";
                desc.style.fontSize = "0.9rem";
                desc.textContent = repo.description ? repo.description.toUpperCase() : "DESCRIPTION: NOT PROVIDED";

                const lang = document.createElement("p");
                lang.style.fontFamily = "monospace";
                lang.style.color = "var(--text-secondary)";
                lang.style.marginBottom = "15px";
                lang.textContent = `PRIMARY SUBSYSTEM: ${repo.language ? repo.language.toUpperCase() : "UNKNOWN"}`;

                const btnContainer = document.createElement("div");
                btnContainer.style.display = "flex";
                btnContainer.style.gap = "10px";

                // BUTTON 1: GITHUB SOURCE CODE
                if (repo.html_url) {
                    const btnSource = document.createElement("a");
                    btnSource.href = repo.html_url;
                    btnSource.target = "_blank"; // OPEN IN NEW TAB
                    btnSource.className = "lcars-btn small";
                    btnSource.textContent = "SOURCE CODE";
                    btnSource.setAttribute("title", "ACCESS GITHUB REPOSITORY");
                    btnContainer.appendChild(btnSource);
                }

                // BUTTON 2: LIVE DEMO (GENERATES ONLY IF HOMEPAGE LINK EXISTS ON GITHUB)
                if (repo.homepage && repo.homepage !== "") {
                    const btnLive = document.createElement("a");
                    btnLive.href = repo.homepage;
                    btnLive.target = "_blank"; // OPEN IN NEW TAB
                    btnLive.className = "lcars-btn small";
                    btnLive.style.backgroundColor = "var(--lcars-color-2)"; // HIGHLIGHT COLOR
                    btnLive.textContent = "LIVE DEMO";
                    btnLive.setAttribute("title", "ACCESS LIVE DEPLOYMENT");
                    btnContainer.appendChild(btnLive);
                }

                card.appendChild(title);
                card.appendChild(desc);
                card.appendChild(lang);
                card.appendChild(btnContainer);

                repoListContainer.appendChild(card);
            });

        } catch (error) {
            console.error("TELEMETRY ERROR: ", error);
            repoListContainer.innerHTML = '<p class="system-text" style="color: var(--lcars-color-alert); ' +
                'text-align:center;">UPLINK FAILED. UNABLE TO RETRIEVE DATA.</p>';
        }
    }

    // FUNCTION TO CLOSE BIO MODAL WITH SEQUENTIAL ANIMATIONS
    function closeBioModal() {
        if (isAudioEnabled) {
            let doorClone = soundDoors.cloneNode();
            doorClone.volume = 0.5;
            doorClone.play().catch(e => console.log("AUDIO BLOCKED BY BROWSER"));
        }

        bioScreen.classList.remove("fade-in");
        setTimeout(() => {
            bioScreen.classList.add("hidden");
            bioBeamLeft.className = "beam-left-bio beam-close-horizontal-left";
            bioBeamRight.className = "beam-right-bio beam-close-horizontal-right";

            setTimeout(() => {
                bioBeamLeft.className = "beam-left-bio beam-close-vertical-left";
                bioBeamRight.className = "beam-right-bio beam-close-vertical-right";

                setTimeout(() => {
                    bioOverlay.classList.add("hidden");
                    bioBeamLeft.className = "beam-left-bio";
                    bioBeamRight.className = "beam-right-bio";
                }, 300);
            }, 500);
        }, 400);
    }


    // =========================================================
    // --- 6. EVENT LISTENERS (PART 2) ---
    // =========================================================

    // SYNCHRONIZED BILINGUAL TRANSLATOR LOGIC
    if (langBtns) {
        langBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                // AUDIO FEEDBACK: LCARS CONFIRMATION BEEP
                if (isAudioEnabled) {
                    let beepClone = soundLang.cloneNode();
                    beepClone.volume = 0.4;
                    beepClone.play().catch(e => console.log("AUDIO BLOCKED BY BROWSER"));
                }

                isPolish = !isPolish;

                // UPDATE ALL TEXT VISIBILITY GLOBALLY
                elementsEng.forEach(el => el.classList.toggle("hidden", isPolish));
                elementsPl.forEach(el => el.classList.toggle("hidden", !isPolish));

                // UPDATE ALL BUTTONS TO MATCH STATE
                langBtns.forEach(b => {
                    b.textContent = isPolish ? "LANG: ENG" : "LANG: PL";
                    b.setAttribute("title", isPolish ? "SWITCH LANGUAGE TO ENGLISH" : "SWITCH LANGUAGE TO POLISH");
                });
            });
        });
    }

    // HOLOGRAPHIC BIO MODAL TRIGGERS
    if (openBioBtn) {
        openBioBtn.addEventListener("click", () => {
            if (isAudioEnabled) {
                let doorClone = soundDoors.cloneNode();
                doorClone.volume = 0.5;
                doorClone.play().catch(e => console.log("AUDIO BLOCKED BY BROWSER"));
            }
            bioOverlay.classList.remove("hidden");
            setTimeout(() => {
                bioBeamLeft.classList.add("beam-animate-vertical");
                bioBeamRight.classList.add("beam-animate-vertical");
            }, 100);
            setTimeout(() => {
                bioBeamLeft.classList.replace("beam-animate-vertical", "beam-animate-horizontal-left");
                bioBeamRight.classList.replace("beam-animate-vertical", "beam-animate-horizontal-right");
            }, 400);
            setTimeout(() => {
                bioScreen.classList.remove("hidden");
                setTimeout(() => bioScreen.classList.add("fade-in"), 50);
            }, 900);
        });
    }

    // BIO MODAL CLOSE TRIGGERS
    if (closeBioBtn) closeBioBtn.addEventListener("click", closeBioModal);
    if (bioOverlay) {
        bioOverlay.addEventListener("click", (e) => {
            if (e.target === bioOverlay || e.target.id === "bio-modal-container") closeBioModal();
        });
    }

    // DYNAMIC GITHUB BUTTONS AUDIO (EVENT DELEGATION)
    // NOW SAFELY ENCAPSULATED INSIDE DOMContentLoaded
    if (repoListContainer) {
        repoListContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".lcars-btn");

            if (btn && isAudioEnabled) {
                let engageClone = soundPublicRepo.cloneNode();
                engageClone.volume = 0.5;
                engageClone.play().catch(err => console.log("AUDIO BLOCKED BY BROWSER"));
            }
        });
    }

});