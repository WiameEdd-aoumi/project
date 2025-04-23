import express from 'express';
const router = express.Router();
import User from '../models/user.js';

import {register,login,logout} from '../controllers/userController.js';

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);





export default router;