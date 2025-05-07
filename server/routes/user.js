import express from 'express';
const router = express.Router();
import User from '../models/user.js';

import {register,login,logout} from '../controllers/userController.js';

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

//dashboard routes
router.get('/Tdashboard', (req, res) => {
    if (req.session.user && req.session.user.role === 'teacher') {
        res.render('Tdashboard',{user:req.session.user}, );
    } else {
        res.redirect('/loginStudent?role=teacher'); // Redirect to login if not authenticated
    }
});
router.get('/Sdashboard',(req,res)=>{
    if (req.session.user && req.session.role==='student'){
        res.render('student_dashboard',{user:req.session.user});

    }else{
        res.status(403).json({message:'acces denied plese log in as student'})
    }
})



export default router;