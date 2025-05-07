import { Exam, Question, Student } from '../models/exam.js';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
 
// set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // specify the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // append the current timestamp to the file name
    }
});

const upload = multer({ storage: storage });
// Create an exam and generate unique link
export const createExam = async (req, res) => {
  try {
    console.log(req.body)
    console.log(req.session.user.id)
    if (!req.session.user || req.session.user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    console.log('heloooooo')
    const { title, subject, level, duration, date ,questionsCount,examType} = req.body;
    const examId = crypto.randomBytes(8).toString('hex');
    let media;
    if (req.file) {
        media=`/uploads/${req.file.filename}`;
    }
    const exam = new Exam({
      title,
      subject,
      level,
      duration,
      date,
      questionsCount,
      examType,
     media,
     createdat: new Date(),
    createdby: req.session.user.id,
    examId: examId,
      teacherId: req.session.user.id,
      accessLink: `/exam/${examId}`, // will be used in frontend
    });
console.log( exam)
    await exam.save();
    res.status(201).json({ success: true, message: 'Exam created', exam });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add question (QCM or direct)
export const addQuestion = async (req, res) => {
  try {
    const { examId, questionType, text, optionA,optionB,optionC,optionD, correctAnswer, directAnswer, tolerance, points, duration, order } = req.body;
    let media='';
    if (req.file) {
        media=`/uploads/${req.file.filename}`;
    }
    const newQuestion={
      examId: examId,
      questionType,
      text,
      media,
      points,
      duration,
      order
    };
    if (questionType === 'qcm') {
      if (!optionA || !optionB || !optionC || !optionD || !correctAnswer) {
        return res.status(400).json({ message: 'Please fill all QCM fields' });
      }
      newQuestion.options = {
        A: optionA,
        B: optionB,
        C: optionC,
        D: optionD
      };
      newQuestion.correctAnswer = correctAnswer;
    } else if (questionType === 'direct') {
      if (!directAnswer || !tolerance) {
        return res.status(400).json({ message: 'Please fill all direct question fields' });
      }
      newQuestion.directAnswer = directAnswer;
      newQuestion.tolerance = tolerance|| 0; // default tolerance to 0 if not provided
    }
    const question = new Question(newQuestion);
        

    await question.save();
    const addedCount = await Question.countDocuments({ examId });
const exam = await Exam.findById(examId);
const remaining = exam.questionsCount - addedCount;

res.status(201).json({
  success: true,
  message: 'Question added',
  question,
  remaining,
  total: exam.questionsCount,
  exam:{
     accessLink: `/exam/${exam.examId}` // you generate this with `/exam/${examId}` 
  }

});


  
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Fetch all exams for teacher dashboard
export const getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ teacherId: req.session.user._id });
    res.status(200).json({ success: true, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Student starts an exam using the link
export const startExam = async (req, res) => {
  try {
    const { link } = req.params;
    const exam = await Exam.findOne({ accessLink: `/exam/${link}` }).populate('teacherId');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

    const questions = await Question.find({ examId: exam._id }).sort({ order: 1 });
    res.render('studentExam', { exam, questions, student: req.session.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Submit exam answers
export const submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;

    const questions = await Question.find({ examId: examId });
    let score = 0;

    // Evaluate score
    questions.forEach((q, index) => {
      if (q.questionType === 'qcm' && q.correctAnswer === answers[index]) score += q.points;
      else if (q.questionType === 'direct' && q.directAnswer.toLowerCase() === answers[index].toLowerCase()) score += q.points;
    });

    const studentExam = new Student({
      examId: examId,
      studentId: req.session.user._id,
      score,
      status: 'completed',
      answers,
      startTime: new Date(),
      endTime: new Date()
    });

    await studentExam.save();
    res.redirect('/Sdashboard');
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Student view scores
export const viewScores = async (req, res) => {
  try {
    const exams = await Student.find({ studentId: req.session.user._id }).populate('examid');
    res.render('studentScores', { exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export {upload};
