import express from 'express';


const router = express.Router();

router.get('/', (req, res) => {
  res.render('index')});

router.get('/loginStudent', (req, res) => {
  res.render('loginStudent')});

export default router;