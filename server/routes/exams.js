import express from 'express';
import { createExam, addQuestion, getExams, startExam, submitExam, viewScores,upload, getPastExams, getUpcomingExams,getStudentScores} from '../controllers/examController.js';

const router = express.Router();
router.post('/createExam', upload.single('media'), createExam); // Use the multer middleware for file uploads
router.post('/addQuestion', upload.single('media'), addQuestion); // Use the multer middleware for file uploads

// Route to create an exam
router.post('/exams/create', createExam);

// Route to add a question to an exam
router.post('/addQuestion', addQuestion);

// Route to fetch exams for the logged-in teacher
router.get('/list', getExams);

// Route to start an exam (for students)
router.get('/exam/:link', startExam);
router.get('/upcoming-exams', getUpcomingExams);
router.get('/past-exams', getPastExams);
router.get('/scores', getStudentScores);
router.post('/submit/:examId', submitExam);

// Route for student to view scores
router.get('/scores', viewScores);

export default router;