document.addEventListener("DOMContentLoaded", () => {
  const examForm = document.getElementById("examForm");
  const questionForm = document.getElementById("questionForm");
  const createBtn = document.getElementById("createExamBtn");
  const viewBtn = document.getElementById("viewExamsBtn");
  
  let totalQuestions = 0; // Initialize total questions count
  let addedQuestions = 0; // Initialize added questions count

  // Toggle fields for question type

  document.getElementById("questionType").addEventListener("change", () => {
    const type = document.getElementById("questionType").value;
    document.getElementById("qcmFields").style.display = type === "qcm" ? "block" : "none";
    document.getElementById("directFields").style.display = type === "direct" ? "block" : "none";
  });

  // Navigation buttons
  createBtn.addEventListener("click", () => {
    document.getElementById("examenFormSection").style.display = "block";
    document.getElementById("ajouterQuestionsSection").style.display = "none";
  });

  viewBtn.addEventListener("click", () => {
    location.href = "/teacher/exams"; // Redirect to exams view
  });
// 
 // Submit exam creation
  examForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(examForm);

    try {
      const response = await fetch("/api/exams/create", {
        method: "POST",
        body: formData,
      });
      /////////////////////////////////////////////////////////////
      const result = await response.json();

      if (response.ok) {
        // Store the exam ID in localStorage for use in adding questions
        localStorage.setItem("currentExamId", result.exam._id);
        totalQuestions =parseInt(result.exam.questionsCount); ///////////// Get total questions from the response
        addedQuestions=0; // Get total questions from the response

        alert("Examen créé avec succès !");
        examForm.reset();
        //show add question section
        document.getElementById("examenFormSection").style.display = "none";
        document.getElementById("ajouterQuestionsSection").style.display = "block";

        // Update the status message
        document.getElementById("statutAjout").textContent = `Ajoutez maintenant les questions à l'examen "${result.exam.title}"`;
      } else {
        alert("Erreur : " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création de l'examen.");
    }
  });

  // Submit question addition
  questionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const examId = localStorage.getItem("currentExamId");
    if (!examId) return alert("Aucun examen sélectionné.");
    if (addedQuestions >= totalQuestions) {
      return alert("Vous avez déjà ajouté toutes les questions.");
    }

    const formData = new FormData(questionForm);
    formData.append("examId", examId);

    try {
      const response = await fetch("/api/exams/addQuestion", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        const {remaining, total}=result;
        addedQuestions++; 
        if ( remaining > 0) {
          document.getElementById("statutAjout").textContent = `Question ajoutée ! ${remaining} questions restantes`;
          questionForm.querySelector("button[type='submit']").disabled = false; // Enable the submit button for next question
        }
        else {
          document.getElementById("statutAjout").textContent = `Toutes les (${total}) questions ont été ajoutées. examen prêt !`;
          questionForm.querySelector("button[type='submit']").disabled = true; // Disable the submit button after adding all questions
          localStorage.removeItem("currentExamId");
          // generate the link ui
          if (result.exam && result.exam.accessLink) {
            const examLink = `${result.exam.accessLink}`;
            const linkHTML = `
              <div id="examLinkSection" style="margin-top: 20px;">
                <p><strong> lien à partager !</strong></p>
                <input type="text" id="copyExamLinkInput" value="${examLink}" readonly style="width: 80%; padding: 5px;"/>
                <button id="copyLinkBtn" style="margin-top:5px;">Copier le lien</button>
              </div>
            `;
            document.getElementById("statutAjout").insertAdjacentHTML("afterend", linkHTML);
          
            // Add copy + redirect logic
            document.getElementById("copyLinkBtn").addEventListener("click", () => {
              navigator.clipboard.writeText(examLink).then(() => {
                alert("Lien copié ! Redirection vers le tableau de bord...");
                setTimeout(() => {
                  window.location.href = "Tdashboard"; // Replace with your actual dashboard URL
                }, 1000);
              });
            });
          
          } else {
            alert("Erreur : le lien d'examen est manquant.");
          }
          
        
        questionForm.reset();
        document.getElementById("qcmFields").style.display = "none";
        document.getElementById("directFields").style.display = "none";

      } 
    } else {
        alert("Erreur : " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout de la question.");
    }
    


  });
  
});


