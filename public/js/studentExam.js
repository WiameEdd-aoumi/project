document.addEventListener("DOMContentLoaded", () => {
    const examForm = document.getElementById("examForm");
    const questionContainer = document.getElementById("questionContainer");
    const timerDisplay = document.getElementById("timer");
    const currentQuestionIndexInput = document.getElementById("currentQuestionIndex");
    const totalQuestionsInput = document.getElementById("totalQuestions");
    const examDurationInput = document.getElementById("examDuration");

    if (!examForm || !questionContainer || !timerDisplay || !currentQuestionIndexInput || !totalQuestionsInput || !examDurationInput) {
        console.error("Required DOM elements not found");
        return;
    }

    const totalQuestions = parseInt(totalQuestionsInput.value, 10) || 0;
    const examDuration = parseInt(examDurationInput.value, 10) * 60 || 3600; // Default to 1 hour if not set
    let currentQuestionIndex = parseInt(currentQuestionIndexInput.value, 10) || 0;
    let answers = JSON.parse(localStorage.getItem("examAnswers")) || new Array(totalQuestions).fill(null);
    let timeLeft = examDuration;
    let timer;

    // Start timer
    function startTimer() {
        timer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timer);
                submitExam();
                return;
            }
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            timeLeft--;
        }, 1000);
    }

    // Display question
    function displayQuestion(index) {
        if (!questions || index < 0 || index >= questions.length) {
            console.error("Invalid question index or questions data");
            return;
        }
        const question = questions[index];
        questionContainer.innerHTML = `
            <h3>Question ${index + 1}: ${question.text}</h3>
            ${question.questionType === "qcm" ? `
                <label><input type="radio" name="answer" value="A"> ${question.options.A}</label><br>
                <label><input type="radio" name="answer" value="B"> ${question.options.B}</label><br>
                <label><input type="radio" name="answer" value="C"> ${question.options.C}</label><br>
                <label><input type="radio" name="answer" value="D"> ${question.options.D}</label><br>
            ` : `
                <label>Answer: <input type="text" id="directAnswer" name="answer"></label><br>
            `}
            <button type="submit">${index === totalQuestions - 1 ? "Submit Exam" : "Next Question"}</button>
        `;
    }

    // Handle form submission
    examForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const selectedAnswer = document.querySelector('input[name="answer"]:checked')?.value || document.getElementById("directAnswer")?.value;

        if (!selectedAnswer) {
            alert("Please select or enter an answer before proceeding.");
            return;
        }

        answers[currentQuestionIndex] = selectedAnswer;
        localStorage.setItem("examAnswers", JSON.stringify(answers));

        currentQuestionIndex++;
        currentQuestionIndexInput.value = currentQuestionIndex;

        if (currentQuestionIndex < totalQuestions) {
            displayQuestion(currentQuestionIndex);
        } else {
            clearInterval(timer);
            submitExam();
        }
    });

    // Submit exam
    function submitExam() {
        const examId = document.getElementById("examId").value;
        const studentId = document.getElementById("studentId").value;
        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;

        if (!examId || !studentId || !latitude || !longitude) {
            alert("Missing required data for submission.");
            return;
        }

        fetch(`/api/exams/submit/${examId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                studentId,
                answers,
                latitude,
                longitude,
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(`Exam submitted successfully! Your score: ${data.score} / 100`);
                    localStorage.removeItem("examAnswers");
                    window.location.href = "/Sdashboard";
                } else {
                    alert("Error submitting exam: " + data.message);
                }
            })
            .catch(err => {
                console.error("Error submitting exam:", err);
                alert("Failed to submit exam. Please try again.");
            });
    }

    // Initialize
    startTimer();
    displayQuestion(currentQuestionIndex);
});