import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const createToken = User => {
    return jwt.sign({ id: User._id, role: User.role }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });};
    
    export const register =async (req, res) => {
    const { name, email, password, role, sexe, etablissement, dateNaissance, filiere } = req.body;
    // 🔥 Corriger role s'il est un tableau
    const correctedRole = Array.isArray(role) ? role[0] : role;

    console.log("received data from frontend:", req.body);
    // Check if all required fields are provided
    if (!name || !email || !password || !role || !sexe || !etablissement || !dateNaissance || !filiere) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        const newUser = new User({
            name,
            email,
            password,
            role: correctedRole,
            sexe,
            etablissement,
            dateNaissance,
            filiere
        });
        await newUser.save()
        
        console.log('User created successfully');
        
        //create token and set it in cookie
        const token = createToken(newUser);
        res.cookie('jwt', token, { httpOnly: true });
        //save user info to session
        req.session.user = {
            id: newUser.id,
            user : newUser,
            email: newUser.email,
            role: newUser.role,
        };
       
                //redirect to appropriate dashboard based on role
                if (newUser.role === 'teacher') {
                   return res.redirect('/Tdashboard'); // Redirect to teacher dashboard
                } else {
                   return res.redirect('/Sdashboard'); // Redirect to student dashboard
                }
            } catch (error) {
                console.error("register error:", error);
                res.status(500).json({
                    message: ' server Error creating user',
                    success: false,
                    error: error.message
                });
            }
        };

export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("login attempt:", req.body);
    // Check if all required fields are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Please fill in all fields' });
    }
    try{
        const foundUser=await User.findOne({ email });
        if (!foundUser) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        //new test
        console.log('user found:' , foundUser)
        console.log('Plain password:', password);
        console.log('Hashed password from DB:', foundUser.password);
        //check if user exists
        const isMatch = await bcrypt.compare(password, foundUser.password);
        console.log('Password match result:', isMatch);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        //create token and set it in cookie
        const token = createToken(foundUser);
        //set token in cookie
        res.cookie('jwt', token, { httpOnly: true });
        //save user info to session
        req.session.user = {
            id : foundUser.id,
            user : foundUser,
            email: foundUser.email,
            role: foundUser.role,
        };
        //redirect to appropriate dashboard based on role
        return res.status(200).json({
            message: 'login succesful',
            role: foundUser.role

        })
        // if (foundUser.role === 'teacher') {
        //    return res.redirect('/Tdashboard'); // Redirect to teacher dashboard
        // } else {
        //    return res.redirect('/Sdashboard'); // Redirect to student dashboard
        // }
        //create token and set it in cookie 
        
    }catch (error) {
        console.error('login error',  error)
        res.status(500).json({
            message: 'Error logging in',
            success: false,
            error: error.message
        });
    }
};
export const logout = async (req, res) => {
    res.cookie('jwt', '', { expires: new Date(0) });
    res.status(200).json({
        message: 'Logout successful',
        success: true
    });
};