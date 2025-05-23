document.addEventListener("DOMContentLoaded", () => {
    const joinExamBtn = document.getElementById("joinExamBtn");
    const pastExamsBtn = document.getElementById("pastExamsBtn");
    const upcomingExamsBtn = document.getElementById("upcomingExamsBtn");
    const joinExamSection = document.getElementById("joinExamSection");
    const upcomingExamsSection = document.getElementById("upcomingExamsSection");
    const pastExamsSection = document.getElementById("pastExamsSection");
    const upcomingExamsList = document.getElementById("upcomingExamsList");
    const pastExamsList = document.getElementById("pastExamsList");
    const joinExamForm = document.getElementById("joinExamForm");

    if (!joinExamBtn || !pastExamsBtn || !upcomingExamsBtn || !joinExamSection || !upcomingExamsSection || !pastExamsSection || !upcomingExamsList || !pastExamsList || !joinExamForm) {
        console.error("Required DOM elements not found");
        return;
    }

    joinExamBtn.addEventListener("click", () => {
        joinExamSection.style.display = "block";
        upcomingExamsSection.style.display = "none";
        pastExamsSection.style.display = "none";
    });

    joinExamForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let examLink = document.getElementById("examLink").value.trim();
        examLink = examLink.replace(/^https?:\/\/[^\/]+/, '').replace(/\/exams\/+/, '/').replace(/\/\/+/, '/');
    console.log('Normalized examLink:', examLink); // Debug link
 const match = examLink.match(/^\/exam\/([a-f0-9]+)$/);
    if (!match) {
      alert("Invalid exam link format. It should be in the format /exam/<examId>");
      return;
    }
       const examId = match[1];
    try {
        // Prompt for geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    // Construct the URL with geolocation parameters
                    const url = `/exam/${examId}?lat=${latitude}&lon=${longitude}`;
                    window.location.href = url;
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    alert("Geolocation is required to join the exam. Please allow location access.");
                }
            );
        } 
    } catch (error) {
        console.error("An error occurred while processing the exam link:", error);
        alert("An unexpected error occurred. Please try again.");
    }

    upcomingExamsBtn.addEventListener("click", () => {
        joinExamSection.style.display = "none";
        upcomingExamsSection.style.display = "block";
        pastExamsSection.style.display = "none";
        fetchUpcomingExams();
    });

    pastExamsBtn.addEventListener("click", () => {
        joinExamSection.style.display = "none";
        pastExamsSection.style.display = "block";
        upcomingExamsSection.style.display = "none";
        fetchPastExams();
    });

    function fetchUpcomingExams() {
        fetch("/api/exams/upcoming-exams")
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    upcomingExamsList.innerHTML = "";
                    data.exams.forEach(exam => {
                        const div = document.createElement("div");
                        div.textContent = `${exam.title} - ${new Date(exam.date).toLocaleDateString()} - Link: ${exam.accessLink}`;
                        upcomingExamsList.appendChild(div);
                    });
                } else {
                    upcomingExamsList.innerHTML = "<div>No upcoming exams</div>";
                }
            })
            .catch(err => console.error("Error fetching upcoming exams:", err));
    }

    function fetchPastExams() {
        fetch("/api/exams/past-exams")
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    pastExamsList.innerHTML = "";
                    data.exams.forEach(exam => {
                        const div = document.createElement("div");
                        div.textContent = `${exam.title} - ${new Date(exam.date).toLocaleDateString()}`;
                        pastExamsList.appendChild(div);
                    });
                } else {
                    pastExamsList.innerHTML = "<div>No past exams</div>";
                }
            })
            .catch(err => console.error("Error fetching past exams:", err));
    }
    });
});