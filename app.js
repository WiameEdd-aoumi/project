import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import expressLayouts from 'express-ejs-layouts';
import apirouter from './server/routes/user.js';
import mainRoute from './server/routes/main.js';


dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(express.static('public'));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.use('/api', apirouter);

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


app.use('/',mainRoute)
//app.use('/api/users', userRoutes);
//app.use('/api/exams', examRoutes);
app.use(cors());
app.use(express.json());
//app.use('/api/auth', authRoutes);
//app.use('/api/exams', examRoutes);

// Basic route for testing