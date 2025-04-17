import express from 'express';


const router = express.Router();

router.post('/login', (req, res) =>{
    const { email, password } = req.body;
    console.log(email, password);
    return res.status(200).json({ message: 'Login successful', email, password });
})

export default router;