document.addEventListener("DOMContentLoaded", () => {
    // === DOM REFERENCES ===
    const quizSettings = document.getElementById("quizSettings");
    const startQuizBtn = document.getElementById("startQuizBtn");
    const questionCountSelect = document.getElementById("questionCount");
    const categorySelect = document.getElementById("category"); // For future multi-topic use
    const revealAnswersToggle = document.getElementById("revealAnswers");

    const startScreen = document.getElementById("startScreen");
    const quizScreen = document.getElementById("quizScreen");
    const reviewScreen = document.getElementById("reviewScreen");

    const questionText = document.getElementById("questionText");
    const optionsContainer = document.getElementById("optionsContainer");
    const progressText = document.getElementById("progressText");
    const scoreTracker = document.getElementById("scoreTracker");
    const quizTime = document.getElementById("timeCounter");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const endQuizBtn = document.getElementById("endQuizBtn");
    const timeProgress = document.getElementById("timeProgress");
    const feedback = document.getElementById("feedback");
    const calculatedTime = document.getElementById("calculatedTime");
    const endQuizModal = document.getElementById("endQuizModal");
    const confirmEndQuiz = document.getElementById("confirmEndQuiz");
    const cancelEndQuiz = document.getElementById("cancelEndQuiz");
    const countdownSpan = document.getElementById("countdownSpan");
    const endQuizLoading = document.getElementById("endQuizLoading");
    const endQuizButtons = document.getElementById("endQuizButtons");
    const endQuizMessage = document.getElementById("endQuizMessage");
    const loadingSpinner = document.getElementById("loadingSpinner");

    // === STATE VARIABLES ===
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let totalQuestions = 0;
    let totalSeconds = 0;
    let elapsedSeconds = 0;
    let timer = null;
    let revealAnswers = false;
    let userAnswers = {};

    // === INITIAL SETUP ===
    function populateQuestionCountOptions() {
        const total = novel2025.length;
        const step = 5;
        questionCountSelect.innerHTML = "";

        for (let i = step; i <= total; i += step) {
            const opt = document.createElement("option");
            opt.value = i;
            opt.textContent = `${i} Questions`;
            if (i === 10) opt.selected = true;
            questionCountSelect.appendChild(opt);
        }

        if (total % step !== 0 || !questionCountSelect.querySelector(`option[value="${total}"]`)) {
            const allOption = document.createElement("option");
            allOption.value = total;
            allOption.textContent = `All (${total}) Questions`;
            questionCountSelect.appendChild(allOption);
        }
    }

    function updateEstimatedTime() {
        const count = parseInt(questionCountSelect.value, 10);
        const totalSeconds = count * 30;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        let timeDisplay = "";
        if (minutes > 0) timeDisplay += `${minutes} min${minutes > 1 ? "s" : ""}`;
        if (seconds > 0) timeDisplay += ` ${seconds} sec${seconds > 1 ? "s" : ""}`;

        calculatedTime.textContent = timeDisplay.trim();
    }

    populateQuestionCountOptions();
    updateEstimatedTime();
    questionCountSelect.addEventListener("change", updateEstimatedTime);

    // === START QUIZ ===
    startQuizBtn.addEventListener("click", () => {
        const count = parseInt(questionCountSelect.value);
        revealAnswers = revealAnswersToggle.checked;

        questions = [...novel2025]
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .map((q) => {
                const ansIndex = q.answer.trim().charCodeAt(0) - 65;
                return { ...q, answer: ansIndex };
            });

        totalQuestions = questions.length;
        currentQuestionIndex = 0;
        score = 0;
        elapsedSeconds = 0;
        totalSeconds = totalQuestions * 30; // Updated to 30 seconds per question
        userAnswers = {};

        startScreen.classList.add("hidden");
        quizScreen.classList.remove("hidden");

        startTimer();
        renderQuestion();
    });

    // === TIMER ===
    function updateProgressBar(percent) {
        timeProgress.style.width = `${percent}%`;
        if (percent > 50) {
            timeProgress.style.backgroundColor = "#10b981"; // green
        } else if (percent > 20) {
            timeProgress.style.backgroundColor = "#f59e0b"; // amber
        } else {
            timeProgress.style.backgroundColor = "#ef4444"; // red
        }
    }

    function startTimer() {
        timer = setInterval(() => {
            elapsedSeconds++;
            const remaining = totalSeconds - elapsedSeconds;
            const min = Math.floor(remaining / 60);
            const sec = remaining % 60;
            quizTime.textContent = `Time Left: ${min}m ${sec.toString().padStart(2, "0")}s`;

            const percent = (elapsedSeconds / totalSeconds) * 100;
            updateProgressBar(percent);

            if (elapsedSeconds >= totalSeconds) {
                clearInterval(timer);
                endQuiz();
            }
        }, 1000);
    }
    function updateProgressBar(percent) {
        timeProgress.style.width = `${percent}%`;
        if (percent > 50) {
            timeProgress.style.backgroundColor = "#10b981"; // green
        } else if (percent > 20) {
            timeProgress.style.backgroundColor = "#f59e0b"; // amber
        } else {
            timeProgress.style.backgroundColor = "#ef4444"; // red
        }
    }

    function startTimer() {
        timer = setInterval(() => {
            elapsedSeconds++;
            const remaining = totalSeconds - elapsedSeconds;
            const min = Math.floor(remaining / 60);
            const sec = remaining % 60;
            quizTime.textContent = `Time Left: ${min}m ${sec.toString().padStart(2, "0")}s`;

            const percent = (elapsedSeconds / totalSeconds) * 100;
            updateProgressBar(percent);

            if (elapsedSeconds >= totalSeconds) {
                clearInterval(timer);
                endQuiz();
            }
        }, 1000);
    }

    function updateProgressBar(percent) {
        timeProgress.style.width = `${percent}%`;

        // Progress bar color (Green → Amber → Red)
        if (percent < 50) {
            timeProgress.style.backgroundColor = "#10b991";
        } else if (percent < 80) {
            timeProgress.style.backgroundColor = "#f59e0b";
        } else {
            timeProgress.style.backgroundColor = "#ef4444";
        }

        // Milestone effects
        if (percent >= 25) {
            milestone25.classList.add("glow-green");
        }
        if (percent >= 50) {
            milestone50.classList.add("glow-amber");
        }
        if (percent >= 75) {
            milestone75.classList.add("glow-red");
        }
    }

    function startTimer() {
        timer = setInterval(() => {
            elapsedSeconds++;
            const remaining = totalSeconds - elapsedSeconds;
            const min = Math.floor(remaining / 60);
            const sec = remaining % 60;
            quizTime.textContent = `Time Left: ${min}m ${sec.toString().padStart(2, "0")}s`;

            const percent = (elapsedSeconds / totalSeconds) * 100;
            updateProgressBar(percent);

            if (elapsedSeconds >= totalSeconds) {
                clearInterval(timer);
                endQuiz();
            }
        }, 1000);
    }

    // === RENDER QUESTION ===
    function renderQuestion() {
        const current = questions[currentQuestionIndex];
        const hasAnswered = userAnswers.hasOwnProperty(currentQuestionIndex);
        const selectedIndex = userAnswers[currentQuestionIndex];
        const correctIndex = current.answer;

        // Animate question area
        questionText.classList.add("animate-fadeSlideIn");
        setTimeout(() => questionText.classList.remove("animate-fadeSlideIn"), 500);

        questionText.textContent = current.question;
        progressText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
        scoreTracker.textContent = `Score: ${score}`;
        feedback.classList.add("hidden");
        optionsContainer.innerHTML = "";

        current.options.forEach((opt, i) => {
            const btn = document.createElement("button");
            btn.className = `
      option-btn bg-gray-100 text-left border rounded-xl px-4 py-3 text-gray-800 
      transition-all duration-300 opacity-0 translate-y-4 animate-slideFadeUp delay-[${i * 100}ms]
    `;
            btn.textContent = opt;
            btn.dataset.index = i;

            if (hasAnswered) {
                btn.disabled = true;
                if (revealAnswers) {
                    if (i === correctIndex) btn.classList.add("bg-green-100", "border-green-500");
                    else if (i === selectedIndex && i !== correctIndex) btn.classList.add("bg-red-100", "border-red-500");
                } else if (i === selectedIndex) {
                    btn.classList.add("bg-blue-100", "border-blue-500");
                }
            }

            btn.addEventListener("click", () => {
                if (!hasAnswered) handleOptionClick(i, btn);
            });

            optionsContainer.appendChild(btn);
        });

        nextBtn.disabled = !hasAnswered;
        prevBtn.disabled = currentQuestionIndex === 0;
    }
    // === HANDLE OPTION SELECT ===
    function handleOptionClick(selectedIndex, btn) {
        const correctIndex = questions[currentQuestionIndex].answer;
        const buttons = optionsContainer.querySelectorAll("button");

        buttons.forEach((b, i) => {
            b.disabled = true;

            if (revealAnswers) {
                if (i === correctIndex) b.classList.add("bg-green-100", "border-green-500");
                else if (i === selectedIndex && i !== correctIndex) b.classList.add("bg-red-100", "border-red-500");
            } else if (i === selectedIndex) {
                b.classList.add("bg-blue-100", "border-blue-500");
            }
        });

        if (selectedIndex === correctIndex) {
            score++;
            feedback.textContent = "Correct!";
            feedback.className = "text-sm text-green-600";
        } else {
            feedback.textContent = "Wrong.";
            feedback.className = "text-sm text-red-600";
        }

        if (revealAnswers) {
            feedback.classList.remove("hidden");
        } else {
            feedback.classList.add("hidden");
        }

        userAnswers[currentQuestionIndex] = selectedIndex;
        nextBtn.disabled = false;
    }

    // === NAVIGATION ===
    nextBtn.addEventListener("click", () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            showResults();
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    });

    let countdownInterval = null;

    // Trigger modal popup
    endQuizBtn.addEventListener("click", () => {
        endQuizModal.classList.remove("hidden");

        // Optional: Haptic Feedback
        if (navigator.vibrate) navigator.vibrate(30);
    });

    // Confirm Ending the Quiz
    confirmEndQuiz.addEventListener("click", () => {
        // Haptic burst
        if (navigator.vibrate) {
            navigator.vibrate([50, 100, 50]);
        }

        // Switch to loading state
        endQuizButtons.classList.add("hidden");
        endQuizLoading.classList.remove("hidden");
        endQuizMessage.textContent = "Processing your result...";
        loadingSpinner.classList.remove("hidden");

        let timeLeft = 2;
        countdownSpan.textContent = timeLeft;

        countdownInterval = setInterval(() => {
            timeLeft--;
            countdownSpan.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                endQuizModal.classList.add("hidden");
                endQuiz();
            }
        }, 1000);
    });

    // Cancel ending
    cancelEndQuiz.addEventListener("click", () => {
        if (navigator.vibrate) navigator.vibrate(20); // Quick tap
        endQuizModal.classList.add("hidden");
        resetModal();
    });

    // Cleanup modal state
    function resetModal() {
        clearInterval(countdownInterval);
        endQuizButtons.classList.remove("hidden");
        endQuizLoading.classList.add("hidden");
        endQuizMessage.textContent = "";
    }

    // Your original endQuiz logic
    function endQuiz() {
        clearInterval(timer); // Stop quiz timer if using one
        showResults(); // Display final results
    }
    
    // === RESULTS SCREEN ===
    function showResults() {
  quizScreen.classList.add("hidden");

  // Step 1: Show loading spinner
  reviewScreen.innerHTML = `
    <div class="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-fadeInSlow">
      <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-indigo-600 font-medium text-lg">Calculating your score...</p>
    </div>
  `;
  reviewScreen.classList.remove("hidden");

  // Step 2: Wait and show result
  setTimeout(() => {
    reviewScreen.classList.add("animate-fadeSlideIn");

    const percentage = Math.round((score / totalQuestions) * 100);
    let badge = "Keep Practicing!";
    let emoji = "🙂";
    let badgeColor = "bg-yellow-100 text-yellow-700";

    if (percentage >= 90) {
      badge = "Excellent!";
      emoji = "🏆";
      badgeColor = "bg-green-100 text-green-700";
    } else if (percentage >= 70) {
      badge = "Good Job!";
      emoji = "👏";
      badgeColor = "bg-blue-100 text-blue-700";
    } else if (percentage >= 50) {
      badge = "Nice Try!";
      emoji = "👍";
      badgeColor = "bg-amber-100 text-amber-700";
    } else {
      badge = "Don't Give Up!";
      emoji = "💪";
      badgeColor = "bg-red-100 text-red-700";
    }

    let html = `
      <section class="p-6 space-y-6 max-w-3xl mx-auto animate-fadeInSlow">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-indigo-700">Quiz Completed</h2>
          <p class="text-lg text-gray-700 mt-2">You scored <strong>${score}</strong> out of <strong>${totalQuestions}</strong> (${percentage}%).</p>
          <div class="inline-block mt-4 px-4 py-2 rounded-full ${badgeColor} font-semibold shadow-sm">
            ${emoji} ${badge}
          </div>
        </div>

        <div class="space-y-6 mt-6">
    `;

    questions.forEach((q, i) => {
      const userIndex = userAnswers[i];
      const correctIndex = q.answer;

      html += `
        <div class="bg-white rounded-xl p-4 shadow border animate-slideUp delay-[${i * 100}ms]">
          <h4 class="font-semibold text-gray-800 mb-2">Q${i + 1}: ${q.question}</h4>
          <ul class="space-y-2">
      `;

      q.options.forEach((opt, j) => {
        let color = "bg-gray-100";
        let border = "border";

        if (j === correctIndex) {
          color = "bg-green-100";
          border = "border-green-500";
        } else if (j === userIndex && j !== correctIndex) {
          color = "bg-red-100";
          border = "border-red-500";
        } else if (j === userIndex && !revealAnswers) {
          color = "bg-blue-100";
          border = "border-blue-500";
        }

        html += `
            <li class="px-4 py-2 rounded-xl ${color} ${border} transition-all duration-300">${opt}</li>
        `;
      });

      html += `</ul></div>`;
    });

    html += `
        </div>

        <div class="text-center sticky bottom-0 bg-white w-full flex justify-around items-center p-4">
          <button onclick="window.location.reload()" class="bg-indigo-600 text-white px-2 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all">
            Try Again
          </button>
      <button onclick="generateCertificate()" class=" hidden bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition">
  Download Certificate
</button>
        </div>
      </section>
    `;

    reviewScreen.innerHTML = html;

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

  }, 1200);
}

function generateCertificate() {
  const userName = prompt("Enter your name for the certificate:") || "Anonymous Learner";
  const quizTitle = "General Knowledge Quiz";
  const date = new Date().toLocaleDateString();
  const scorePercent = Math.floor((score / totalQuestions) * 100);

  document.getElementById("certID").textContent = `CTI-${Date.now()}`;
  document.getElementById("certName").textContent = userName;
  document.getElementById("certQuizTitle").textContent = quizTitle;
  document.getElementById("certScore").textContent = `${score} out of ${totalQuestions} (${scorePercent}%)`;
  document.getElementById("certDate").textContent = date;

  const cert = document.getElementById("certificateContainer");
  cert.classList.remove("hidden");

  // Wait a moment to ensure images load
  setTimeout(() => {
    html2canvas(cert, {
      useCORS: true,
      allowTaint: false,
      logging: true,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${userName.replace(/\s+/g, "_")}_Certificate.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      cert.classList.add("hidden");
    });
  }, 1000); // 1 second delay
}
    window.generateCertificate = generateCertificate;
});