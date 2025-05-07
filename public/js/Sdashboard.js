// public/js/student-dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // Handle "Commencer" (Start) button for available exams
    document.querySelectorAll('.btn-success').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();  // Prevent form submission

            const examId = event.target.closest('form').action.split('/').pop(); // Get the exam ID from form action URL
            // Redirect to the exam page
            window.location.href = `/exam/${examId}`;  // Adjust the URL based on your route structure
        });
    });

    // Handle already finished exam result display
    document.querySelectorAll('.btn').forEach(button => {
        if (button.disabled) {
            button.addEventListener('click', (event) => {
                // Alert user that the exam is finished, replace with your own result-viewing logic
                alert("You have already completed this exam.");
            });
        }
    });

    // Optional: Handle other interactions such as opening modals or displaying hidden elements
    const sidebarLinks = document.querySelectorAll('.sidebar li');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default action
            // Handle sidebar item click, show content dynamically based on selection
            const clickedItem = event.target;
            sidebarLinks.forEach(item => item.classList.remove('active')); // Remove active class from all
            clickedItem.classList.add('active'); // Add active class to clicked item

            // You can add more functionality to load content dynamically (e.g., switch between Dashboard, Exams, etc.)
        });
    });
});

export const getExamsForStudent = async (req, res) => {
    try {
        const exams = await Exam.find(); // You can add logic to filter active exams
        res.render('studentDashboard', { exams });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
