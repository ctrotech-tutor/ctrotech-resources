 document.addEventListener("DOMContentLoaded", () => {
    function isMobileDevice() {
        return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768;
    }

    function isLandscapeMode() {
        return;
    }

    function playWarningSound() {
        const audio = new Audio("https://www.soundjay.com/button/beep-07.wav"); // Replace with your preferred sound
        audio.play().catch(() => console.log("Autoplay blocked"));
    }

    function showWarning() {
        document.body.innerHTML = ""; // Clear content
        playWarningSound(); // Play warning sound

        const warningDiv = document.createElement("div");
        warningDiv.style.cssText = `
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
            padding: 20px;
            background-color: #111;
            color: white;
            font-size: 1.5rem;
            font-family: 'Arial', sans-serif;
        `;

        warningDiv.innerHTML = `
            <div id="warningContent" style="animation: fadeIn 0.5s ease-in-out;">
                <img src="https://cdn-icons-png.flaticon.com/512/25/25694.png" style="filter: brightness(0) invert(1);"
                     alt="Mobile Only" width="80" height="80" style="margin-bottom: 10px;">
                <p>🚀 This web app is only available on mobile devices.</p>
                <p id="warningMessage">${isLandscapeMode() ? "Rotate your device to portrait mode." : "Try opening it on your phone."}</p>
                <button id="retryBtn" style="
                    margin-top: 20px;
                    background-color: #ff4747;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    font-size: 1rem;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: 0.3s;
                ">Retry</button>
                <p id="countdownText" style="margin-top: 10px; font-size: 1rem; opacity: 0.8;"></p>
            </div>

            <style>
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: scale(1); }
                    to { opacity: 0; transform: scale(0.95); }
                }
                #retryBtn:hover {
                    background-color: #ff6666;
                }
            </style>
        `;

        document.body.appendChild(warningDiv);

        // Retry button to check again
        document.getElementById("retryBtn").addEventListener("click", checkDevice);

        let countdown = 5; // Change this value for a different auto-close time
        const countdownText = document.getElementById("countdownText");

        function startCountdown() {
            countdownText.textContent = `Auto-closing in ${countdown} seconds...`;

            const interval = setInterval(() => {
                countdown--;
                countdownText.textContent = `Auto-closing in ${countdown} seconds...`;
                if (countdown <= 0) {
                    clearInterval(interval);
                    closeWarning();
                }
            }, 1000);
        }

        function closeWarning() {
            document.getElementById("warningContent").style.animation = "fadeOut 0.5s ease-in-out";
            setTimeout(() => {
                location.reload(); // Refresh when countdown ends
            }, 500);
        }

        // Watch for screen rotation
        function watchOrientation() {
            if (!isLandscapeMode()) {
                document.getElementById("warningMessage").textContent = "Detected portrait mode! Closing soon...";
                startCountdown();
            }
        }

        window.addEventListener("resize", watchOrientation);
    }

    function checkDevice() {
        if (!isMobileDevice() || isLandscapeMode()) {
            showWarning();
        }
    }

    checkDevice(); // Initial check
    window.addEventListener("resize", checkDevice); // Live monitoring
});