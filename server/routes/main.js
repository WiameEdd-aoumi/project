import express from 'express';


const router = express.Router();
// home page
router.get('/', (req, res) => {
  res.render('index')});




//store selected role in session
router.post('/role', (req, res) => {
    const role = req.body.role;
    req.session.role = role; // Store the selected role in session
    res.redirect('/loginStudent'); // Redirect to login page
});
// dynamic login page (shared for both roles)
router.get('/loginStudent', (req, res) => {
    const role = req.query.role || req.session.role ||'student'; // Default to 'student' if no role is provided
    res.render('loginStudent', { role });
});

export default router;