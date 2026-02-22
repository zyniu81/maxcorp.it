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

    // --- 6. DYNAMIC GITHUB SENSOR ARRAY (SYSTEM DIAGNOSTICS) ---
    const githubUsername = "zyniu81";
    const skillsPanel = document.querySelector("#skills .panel-body");

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
            skillsPanel.innerHTML = "<p class='skill-row'><span class='skill-label' style='color: var(--lcars-color-alert);'>UPLINK FAILED</span></p>";
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

    // INITIATE SCAN SEQUENCE
    if (skillsPanel) {
        fetchGitHubStats();
    }

    // --- 7. HOLOGRAPHIC REPOSITORY MODAL ---
    const modalOverlay = document.getElementById("repo-modal-overlay");
    const modalScreen = document.getElementById("repo-modal-screen");
    const beamLeft = document.querySelector(".beam-left");
    const beamRight = document.querySelector(".beam-right");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const repoListContainer = document.getElementById("repo-list-container");

    // TARGET THE "DATABASE CONTROLLER" BUTTON AS TRIGGER
    const btnOpenModal = document.querySelector('a[title="ACCESS PROJECT REPOSITORY"]');

    if (btnOpenModal) {
        btnOpenModal.addEventListener("click", (e) => {
            e.preventDefault(); // PREVENT DEFAULT LINK JUMP

            // PHASE 1: SHOW DARK OVERLAY AND DOTS
            modalOverlay.classList.remove("hidden");

            // PHASE 2: VERTICAL BEAM GROW
            setTimeout(() => {
                beamLeft.classList.add("beam-animate-vertical");
                beamRight.classList.add("beam-animate-vertical");
            }, 100);

            // PHASE 3: HORIZONTAL BEAM SLIDE
            setTimeout(() => {
                beamLeft.classList.replace("beam-animate-vertical", "beam-animate-horizontal-left");
                beamRight.classList.replace("beam-animate-vertical", "beam-animate-horizontal-right");
            }, 400);

            // PHASE 4: REVEAL SCREEN AND LOAD DATA
            setTimeout(() => {
                modalScreen.classList.remove("hidden");
                setTimeout(() => modalScreen.classList.add("fade-in"), 50);

                // INITIATE DATA FETCH (BLENDS GITHUB WITH MANUAL PROJECTS)
                loadRepositoryData();
            }, 900);
        });
    }

    // FUNCTION TO CLOSE MODAL AND RESET ANIMATIONS
    function closeRepoModal() {
        modalOverlay.classList.add("hidden");
        modalScreen.classList.add("hidden");
        modalScreen.classList.remove("fade-in");

        // RESET BEAM CLASSES TO DEFAULT STATE
        beamLeft.className = "beam-left";
        beamRight.className = "beam-right";

        // RESET SCREEN CONTENT FOR NEXT USE
        repoListContainer.innerHTML = '<p class="system-text blink" style="text-align:center; padding: 20px;">AWAITING SENSOR DATA...</p>';
    }

    // ATTACH CLOSE EVENTS
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeRepoModal);

    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            // CLOSE ONLY IF CLICKING THE DARK OVERLAY, NOT THE SCREEN ITSELF
            if (e.target === modalOverlay || e.target.id === "repo-modal-container") {
                closeRepoModal();
            }
        });
    }

    // FUNCTION TO FETCH GITHUB REPOS AND MIX WITH MANUAL PROJECTS
    async function loadRepositoryData() {

        // ---------------------------------------------------------
        // YOUR MANUAL PROJECTS DATABASE (NO GITHUB LINK REQUIRED)
        // ---------------------------------------------------------
        const manualProjects = [
            {
                name: "PRIVATE UI DEMO",
                description: "A SMALL BUT FUNCTIONAL FRONTEND PROTOTYPE NOT HOSTED ON GITHUB.",
                language: "HTML/CSS/JS",
                html_url: null, // LEAVE NULL TO HIDE "SOURCE CODE" BUTTON
                homepage: "https://example.com/moj-fajny-projekt" // ADD LIVE DEMO LINK HERE
            },
            // YOU CAN ADD MORE PROJECTS HERE LATER SEPARATED BY COMMAS
        ];
        // ---------------------------------------------------------

        try {
            // FETCH GITHUB DATA (REUSING THE USERNAME VARIABLE FROM DIAGNOSTICS)
            const response = await fetch(`https://api.github.com/users/${githubUsername}/repos`);
            if (!response.ok) throw new Error("API COMMS FAILURE");
            const gitRepos = await response.json();

            // COMBINE GITHUB REPOS WITH MANUAL PROJECTS
            const allProjects = [...gitRepos, ...manualProjects];

            // CLEAR THE "AWAITING DATA" MESSAGE
            repoListContainer.innerHTML = "";

            // RENDER EACH PROJECT INTO THE SCROLLABLE WINDOW
            allProjects.forEach(repo => {
                // SKIP FORKED REPOS TO KEEP LIST CLEAN (OPTIONAL)
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

                // BUTTON 1: GITHUB SOURCE CODE (GENERATES ONLY IF GITHUB LINK EXISTS)
                if (repo.html_url) {
                    const btnSource = document.createElement("a");
                    btnSource.href = repo.html_url;
                    btnSource.target = "_blank"; // OPEN IN NEW TAB
                    btnSource.className = "lcars-btn small";
                    btnSource.textContent = "SOURCE CODE";
                    btnSource.setAttribute("title", "ACCESS GITHUB REPOSITORY");
                    btnContainer.appendChild(btnSource);
                }

                // BUTTON 2: LIVE DEMO (GENERATES ONLY IF HOMEPAGE LINK EXISTS)
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
            repoListContainer.innerHTML = '<p class="system-text" style="color: var(--lcars-color-alert); text-align:center;">UPLINK FAILED. UNABLE TO RETRIEVE DATA.</p>';
        }
    }
});