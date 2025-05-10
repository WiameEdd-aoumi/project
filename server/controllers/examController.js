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
    createdby: req.session.user._id,
    examId: examId,
      teacherId: req.session.user._id,
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
      points:points||10,
      duration:duration||30,
      order: order||1
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
      if (!directAnswer) {
        return res.status(400).json({ message: 'Please fill all direct question fields' });
      }
      newQuestion.directAnswer = directAnswer;
      newQuestion.tolerance = tolerance|| 0; // default tolerance to 0 if not provided
    }
    const question = new Question(newQuestion);
        

    await question.save();
    await Exam.findByIdAndUpdate(examId, { $push: { questions: question._id } });
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
     accessLink: exam.accessLink // you generate this with `/exam/${examId}` 
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
//get upcoming exams
export const getUpcomingExams = async (req, res) => {
  try {
      const now = new Date();
      const exams = await Exam.find({ date: { $gte: now }, teacherId: { $ne: req.session.user._id }, })
          .select('title subject level date duration examId accessLink');
      res.json({ success: true, exams });
  } catch (err) {
      console.error('Upcoming exams error:', err);
      res.status(500).json({ success: false, message: err.message });
  }
};
//Get past exams
export const getPastExams = async (req, res) => {
    try {
        const now = new Date();
        const exams = await Exam.find({ date: { $lt: now }, teacherId: { $ne: req.session.user._id }, })
            .select('title subject date examId accessLink');
        res.json({ success: true, exams });
    } catch (err) {
        console.error('Past exams error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
// Get student scores
export const getStudentScores = async (req, res) => {
  try {
      if (!req.session.user || !req.session.user._id) {
          return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
      const scores = await Student.find({ studentId: req.session.user._id })
          .populate('examId', 'title subject date questionsCount')
          .select('score endTime answers');
      res.json({ success: true, scores });
  } catch (err) {
      console.error('Student scores error:', err);
      res.status(500).json({ success: false, message: err.message });
  }
};



// Student starts an exam using the link
export const startExam = async (req, res) => {
  try {
    console.log('start exam -request:', req.params, req.query);
    console.log('start exam - request:', req.params, req.query);
        if (!req.session.user || req.session.user.role !== 'student') {
            return res.status(403).json({ success: false, message: 'Please log in as a student to access the exam' });
        }
    const { link } = req.params;
    if (!link) {
      return res.status(400).json({ success: false, message: 'Exam link is missing' });
  }
    const exam = await Exam.findOne({ accessLink: `/exam/${link}` }).populate('teacherId');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    //Check if exam date is in the future
    const now = new Date();
    if (new Date(exam.date) < now) {
        return res.status(403).json({ success: false, message: 'This exam has already ended' });
    }

// record geolocation if provided
const latitude= req.query.lat;
const longitude= req.query.lon;
if (!latitude || !longitude){
  return res.status(400).json({ success: false, message: 'Geolocation is required' });
} console.log(`geolocation recorded: ${latitude},${longitude}`);

  const questions = await Question.find({ examId: exam._id }).sort({ order: 1 });
  if (questions.length===0){
      return res.status(404).json({ success: false, message: 'No questions available for this exam' });
  }console.log('Questions fetched:', questions); // Debug log
  const initialTime = Date.now();
        const endTime = new Date(initialTime + (exam.duration * 60 * 1000)).toISOString();
   res.render('studentExam', { exam,
     questions, 
     student: req.session.user,
      initialTime ,
      endTime,
      latitude,
    longitude,
      
    });
  } catch (err) {
    console.error('start exam error', err)
    res.status(500).json({ success: false, message: err.message });
  }
};

// Submit exam answers 
export const submitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId, answers, latitude, longitude } = req.body;
    const exam = await Exam.findById(examId).populate('questions');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    if (!exam.questions || exam.questions.length === 0) {
        return res.status(404).json({ success: false, message: 'No questions found for this exam' });
    }
    let score = 0;
    const totalPossiblePoints = exam.questions.reduce((sum, q) => sum + (q.points || 10), 0);
    const maxScore=100;

    // Evaluate score
  //  exam.questions.forEach((question, index) => {

  //     if (question.questionType === 'qcm' && question.correctAnswer === answers[index]) {
  //       score += ((question.points|| 10)/totalPossiblePoints) * maxScore;
  //     }
  //     else if (question.questionType === 'direct'){
  //       const studentAnswer = answers[index]?.toLowerCase().trim()||'';
  //       const correctAnswer = question.directAnswer?.toLowerCase().trim()||'';
  //       const tolerance = question.tolerance || 0;
  //       if (studentAnswer === correctAnswer || (parseFloat(studentAnswer) && Math.abs(parseFloat(studentAnswer) - parseFloat(correctAnswer)) <= tolerance)) {
  //         score += (question.points / totalPossiblePoints) * maxScore;
  //       }
        
  //    }
  //       });
  //       score = Math.round(score);

  //   const studentExam = new Student({
  //     examId: examId,
  //     studentId: req.session.user._id || studentId,
  //     score,
  //     status: 'completed',
  //     answers,
  //     latitude,
  //     longitude,
  //     startTime: new Date(),
  //     endTime: new Date()
  //   });
      // Evaluate score
    exam.questions.forEach((question, index) => {
      console.log(`Evaluating question ${index + 1}:`, {
        questionType: question.questionType,
        text: question.text,
        correctAnswer: question.correctAnswer,
        directAnswer: question.directAnswer,
        tolerance: question.tolerance,
        points: question.points
      });
      console.log(`Student answer for question ${index + 1}:`, answers[index]);
      if (question.questionType === 'qcm') {
        const studentAnswer = answers[index]?.trim();
        const correctAnswer = question.correctAnswer?.trim();
        console.log(`QCM comparison - Student: ${studentAnswer}, Correct: ${correctAnswer}`);
        if (studentAnswer === correctAnswer) {
          const pointsAwarded = ((question.points || 10) / totalPossiblePoints) * maxScore;
          score += pointsAwarded;
          console.log(`QCM score added: ${pointsAwarded}`);
        } else {
          console.log('QCM answer incorrect');
        }
      } else if (question.questionType === 'direct') {
        const studentAnswer = answers[index]?.toLowerCase().trim() || '';
        const correctAnswer = question.directAnswer?.toLowerCase().trim() || '';
        const tolerance = question.tolerance || 0;
        console.log(`Direct comparison - Student: "${studentAnswer}", Correct: "${correctAnswer}", Tolerance: ${tolerance}`);
        const isNumeric = !isNaN(parseFloat(studentAnswer)) && !isNaN(parseFloat(correctAnswer));
        if (studentAnswer === correctAnswer || 
            (isNumeric && Math.abs(parseFloat(studentAnswer) - parseFloat(correctAnswer)) <= tolerance)) {
          const pointsAwarded = (question.points / totalPossiblePoints) * maxScore;
          score += pointsAwarded;
          console.log(`Direct score added: ${pointsAwarded}`);
        } else {
          console.log('Direct answer incorrect');
        }
      }
    });
    score = Math.round(score);
    console.log(`Final calculated score: ${score}`);

    const studentExam = new Student({
      examId: examId,
      studentId: req.session.user._id || studentId,
      score,
      status: 'completed',
      answers,
      latitude,
      longitude,
      startTime: new Date(),
      endTime: new Date()
    });

    await studentExam.save();
    res.json({ success: true, score, message: 'Exam submitted successfully' });
   //res.redirect('/Sdashboard');
  } catch (err) {
    console.error('Submit Exam Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}; 
// Student view scores
export const viewScores = async (req, res) => {
  try {
    const exams = await Student.find({ studentId: req.session.user._id }).populate('examId');
    res.render('studentScores', { exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export {upload};
