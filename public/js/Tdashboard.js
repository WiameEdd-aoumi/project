function handleUpload() {
    const name = document.getElementById("examName").value;
    const date = document.getElementById("examDate").value;
    const duration = document.getElementById("examDuration").value;
    const file = document.getElementById("qcmFile").files[0];

    if (!name || !date || !duration || !file) {
      alert("Please fill all fields.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.trim().split("\n");
      const questions = [];

      lines.slice(1).forEach(line => {
        const [q, a, b, c, d, correct] = line.split(",");
        questions.push({
          question: q,
          options: [a, b, c, d],
          correct: parseInt(correct) - 1
        });
      });

      const examData = { name, date, duration, questions };
      localStorage.setItem("qcm_exam", JSON.stringify(examData));
      document.getElementById("successMsg").style.display = "block";
    };
    reader.readAsText(file);
  }
