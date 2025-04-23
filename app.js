import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import expressLayouts from 'express-ejs-layouts';

import mainRoute from './server/routes/main.js';
import session from 'express-session';
import userRoutes from './server/routes/user.js';



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

//set Ejs as view engine
app.set('view engine', 'ejs');
app.set('views', './server/views');




//Routes
app.use('/',mainRoute)
app.use('/api', userRoutes);
//home page
app.get('/', (req, res) => {
    res.render('index');

});
//handle role selzction (student or teacher)
app.post('/role', (req, res) => {
    const role = req.body.role;
    res.render('loginStudent', { role });
});
//login page (dynamic based on role)
app.get('/loginStudent', (req, res) => {
    const role = req.query.role || 'student'; // Default to 'student' if no role is provided;
    res.render('loginStudent', { role });
});

// teacher dashboard (protected route)
app.get('/Tdashboard', (req, res) => {
    if (req.session.user && req.session.user.role === 'teacher') {
        res.render('Tdashboard', );
    } else {
        res.redirect('/loginStudent?role=teacher'); // Redirect to login if not authenticated
    }
});
// student dashboard (protected route)
app.get('/Sdashboard', (req, res) => {
    if (req.session.user && req.session.user.role === 'student') {
        res.render('Sdashboard', );
    } else {
        res.redirect('/loginStudent?role=student'); // Redirect to login if not authenticated
    }
});


// Database connection
const dbURI = 'mongodb+srv://eddaoumiwiame:oiKbrWMOlrHELlBG@cluster0.lsnipd2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(dbURI)
  .then(() => {
    console.log('MongoDB Connected...');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running on port http://localhost:${process.env.PORT || 5000}`);
    });
  })
  .catch(err => console.error(err.message,));


//app.use('/api/exams', examRoutes);

//app.use('/api/exams', examRoutes);

// Basic route for testing