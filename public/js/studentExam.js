document.addEventListener("DOMContentLoaded", () => {
    console.log('studentExam.js loaded successfully');

    const examTitle = document.getElementById("examTitle");
    const examDetails = document.getElementById("examDetails");
    const countdown = document.getElementById("countdown");
    const examContent = document.getElementById("examContent");
    const questionsContainer = document.getElementById("questionsContainer");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");
    const examForm = document.getElementById("examForm");
    const scoreDisplay = document.getElementById("scoreDisplay");
    const examEnded = document.getElementById("examEnded");

    if (!examTitle || !examDetails || !countdown || !examContent || !questionsContainer || !nextBtn || !submitBtn || !examForm || !scoreDisplay || !examEnded) {
        console.error('Required DOM elements not found');
        examTitle.textContent = "Error: Page elements are missing.";
        return;
    }

    const examData = window.examData;
    if (!examData) {
        console.error('examData missing:', examData);
        examTitle.textContent = "Error: Exam data is missing.";
        return;
    }

    // Check if the exam has ended based on the flag from the backend
    if (examData.examEnded) {
        console.log('Exam has ended based on server flag.');
        examEnded.style.display = 'block';
        examContent.style.display = 'none';
        examTitle.style.display = 'none'; // Hide the exam title
        examDetails.style.display = 'none'; // Hide the exam details
        examEnded.innerHTML = `
            <div style="
                background-color: #fff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                text-align: center;
                color: #333;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            ">
                <h2 style="color: #e74c3c; margin-bottom: 20px;">Oops ! L'examen est terminé 🕒</h2>
                <p style="font-size: 1.1em; margin: 10px 0;">
                    Cet examen s'est terminé à ${new Date(examData.endTime).toLocaleString()}.
                </p>
                <p style="font-size: 1em; margin: 10px 0;">
                    Si vous avez des questions ou besoin d'assistance, veuillez contacter le <strong>département de votre filière</strong>.
                </p>
                <div style="margin-top: 20px;">
                    <span style="font-size: 1.5em;">📚</span>
                </div>
            </div>
        `;
        return;
    }

    if (!examData.questions || !Array.isArray(examData.questions)) {
        console.error('questions missing:', examData);
        examTitle.textContent = "Error: Exam questions are missing or invalid.";
        return;
    }

    console.log('Exam data received:', examData);

    examTitle.textContent = `Examen: ${examData.title}`;
    examDetails.textContent = `Matière: ${examData.subject} | Niveau: ${examData.level} | Durée: ${examData.duration / 60000} minutes`;

    let currentQuestionIndex = 0;
    let answers = new Array(examData.questions.length).fill('');
    let timerInterval; // Moved to outer scope
    const now = Date.now();
    const examStartTime = new Date(examData.date).getTime();
    const examEndTime = new Date(examData.endTime).getTime();

    console.log('Current time:', new Date(now).toISOString());
    console.log('Exam start time:', new Date(examStartTime).toISOString());
    console.log('Exam end time:', new Date(examEndTime).toISOString());

    if (now < examStartTime) {
        console.log('Exam not yet started. Showing countdown.');
        countdown.style.display = 'block';
        function updateCountdown() {
            const timeLeft = examStartTime - Date.now();
            console.log('Time left to start:', timeLeft);
            if (timeLeft <= 0) {
                console.log('Countdown finished. Starting exam.');
                clearInterval(countdownInterval);
                countdown.style.display = 'none';
                examContent.style.display = 'block';
                startExam();
                return;
            }
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            countdown.textContent = `Exam starts in: ${hours}h ${minutes}m ${seconds}s`;
        }
        const countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();
        return;
    } else if (now > examEndTime) {
        console.log('Exam has ended.');
        examEnded.style.display = 'block';
        examEnded.textContent = 'Oops, the exam has ended.';
        examContent.style.display = 'none';
        return;
    } else {
        console.log('Exam is in progress. Starting exam.');
        examContent.style.display = 'block';
        startExam();
    }

    function startExam() {
        console.log('Starting exam with duration:', examData.duration);
        const endTime = examEndTime;
        function updateTimer() {
            const timeLeft = endTime - Date.now();
            console.log('Time left in exam:', timeLeft);
            if (timeLeft <= 0) {
                console.log('Time is up. Submitting exam.');
                timer.textContent = "Temps écoulé !";
                clearInterval(timerInterval);
                submitExam();
                return;
            }
            const minutes = Math.floor(timeLeft / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            timer.textContent = `Temps restant: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
        const timer = document.createElement('div');
        timer.id = 'timer';
        examContent.appendChild(timer);
        timerInterval = setInterval(updateTimer, 1000);
        updateTimer();

        function showQuestion(index) {
            console.log('Showing question index:', index);
            const question = examData.questions[index];
            if (!question) {
                console.error('Question not found at index:', index);
                questionsContainer.innerHTML = '<p>Error: Question not found.</p>';
                return;
            }
            let questionHTML = `
                <div class="question">
                    <p><strong>Question ${index + 1}/${examData.questions.length}:</strong> ${question.text}</p>
            `;
            if (question.questionType === "qcm") {
                if (!question.options) {
                    console.error('QCM options missing for question:', question);
                    questionHTML += '<p>Error: QCM options missing.</p>';
                } else {
                    questionHTML += `
                        ${['A', 'B', 'C', 'D'].map(option => `
                            <label><input type="radio" name="answer${index}" value="${option}" required> ${option}: ${question.options[option] || 'N/A'}</label><br>
                        `).join('')}
                    `;
                }
            } else if (question.questionType === "direct") {
                questionHTML += `
                    <input type="text" name="answer${index}" placeholder="Votre réponse" class="answer-input" required>
                `;
            }
            questionHTML += `</div>`;
            questionsContainer.innerHTML = questionHTML;

            nextBtn.style.display = index < examData.questions.length - 1 ? "block" : "none";
            submitBtn.style.display = index === examData.questions.length - 1 ? "block" : "none";
        }

        showQuestion(currentQuestionIndex);

        nextBtn.addEventListener("click", () => {
            const answer = document.querySelector(`input[name="answer${currentQuestionIndex}"]:checked`)?.value ||
                          document.querySelector(`input[name="answer${currentQuestionIndex}"]`)?.value || '';
            answers[currentQuestionIndex] = answer;
            console.log('Answer for question', currentQuestionIndex, ':', answer);
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        });

        examForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const answer = document.querySelector(`input[name="answer${currentQuestionIndex}"]:checked`)?.value ||
                          document.querySelector(`input[name="answer${currentQuestionIndex}"]`)?.value || '';
            answers[currentQuestionIndex] = answer;
            console.log('Final answer for question', currentQuestionIndex, ':', answer);
            console.log('All answers:', answers);
            submitExam();
        });
    }

    async function submitExam() {
        try {
            console.log('Submitting exam to /api/exams/submit/', examData.examId);
            const response = await fetch(`/api/exams/submit/${examData.examId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: examData.studentId,
                    answers,
                    latitude: examData.latitude,
                    longitude: examData.longitude
                }),
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok) {
                console.log('Exam submitted successfully:', result);
                clearInterval(timerInterval); // Stop the timer on successful submission
                timerInterval = null; // Ensure it's nullified
                scoreDisplay.style.display = 'block';
                scoreDisplay.textContent = `Votre score: ${result.score}%`;
                examForm.style.display = 'none'; // Hide the form to prevent further interaction
            } else {
                console.error('Submission failed:', result.message);
                alert("Erreur lors de la soumission: " + result.message);
            }
        } catch (err) {
            console.error("Submit error:", err);
            alert("Erreur lors de la soumission de l'examen.");
        }
    }
});