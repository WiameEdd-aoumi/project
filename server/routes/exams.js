import express from 'express';
import { createExam, addQuestion, getExams, startExam, viewScores,upload } from '../controllers/examController.js';

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
router.post('/exam/:link', startExam);

// Route for student to view scores
router.get('/scores', viewScores);
router.get('/exam/:link', startExam); // Route to start an exam using the link
export default router;