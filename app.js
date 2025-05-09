import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import expressLayouts from 'express-ejs-layouts';
import { createExam, upload } from './server/controllers/examController.js'; // Import the multer middleware

import mainRoute from './server/routes/main.js';
import session from 'express-session';
import userRoutes from './server/routes/user.js';

import examRoutes from './server/routes/exams.js';
import { Exam } from './server/models/exam.js'; 
import User from './server/models/user.js';
import bcrypt from 'bcryptjs';

// Import the Exam model

dotenv.config();
const app = express();
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.set('layout', 'layouts/main');
app.use('/api/exams', examRoutes); // Use the exam routes
app.use('/uploads', express.static('uploads')); // serve files
app.use('/', examRoutes); // Direct routes like /exam/:link

//set Ejs as view engine
app.set('view engine', 'ejs');
app.set('views', './server/views');




//Routes
app.use('/',mainRoute)
app.use('/api', userRoutes);
//home page


//handle role selzction (student or teacher)
app.post('/role', (req, res) => {
    const role = req.body.role;
    res.redirect(`/loginStudent?role=${role}`); // Redirect to login page with selected role
});
app.post('/api/exams/create', upload.single('media'),createExam); // Use the createExam function from examController

//login page (dynamic based on role)
app.get('/loginStudent', (req, res) => {
    const role = req.query.role || 'student'; // Default to 'student' if no role is provided;
    res.render('loginStudent', { role });
});
// Example login route for teacher
app.post('/loginStudent', async (req, res) => {
    const { email, password } = req.body;
    const teacher = await User.findOne({ email });
    if (teacher && bcrypt.compareSync(password, teacher.password)) {
      req.session.user = teacher; // Store teacher info in session
      res.redirect('/Tdashboard');  // Redirect to the teacher's dashboard
    } else {
      res.status(401).send('Invalid credentials');
    }
  });
  

// teacher dashboard (protected route)
app.get('/Tdashboard', async (req, res) => {
    if (req.session.user && req.session.user.role === 'teacher') {
        const exams = await Exam.find({ teacherId: req.session.user._id });
        res.render('Tdashboard', {user:req.session.user, exams });
    } else {
        res.redirect('/loginStudent?role=teacher'); // Redirect to login if not authenticated
    }
});

// student dashboard (protected route)
app.get('/Sdashboard', async (req, res) => {
    if (req.session.user && req.session.user.role === 'student') {
        const exams = await Exam.find({ studentId: req.session.user._id });
        res.render('Sdashboard', {user:req.session.user, exams });
    } else {
        res.redirect('/loginStudent?role=student'); // Redirect to login if not authenticated
    }
});
//logout route
app.get('/logout', (req, res) => {
  const role = req.session.user ? req.session.user.role : 'student'; // Default to student if role is undefined
  req.session.destroy(err => {
      if (err) {
          console.error('Logout Error:', err);
          return res.status(500).send('Server error during logout');
      }
      console.log('Session destroyed, redirecting to login page with role:', role);
      res.redirect(`/loginStudent?role=${role}`);
  });
});


// Database connection
const dbURI = 'mongodb://localhost:27017/exam_platform';
mongoose.connect(dbURI)
  .then(() => {
    console.log('MongoDB Connected...');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running on port http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.error(err.message,));
export default app;

//app.use('/api/exams', examRoutes);

//app.use('/api/exams', examRoutes);

// Basic route for testing