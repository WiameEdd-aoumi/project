import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const createToken = User => {
    return jwt.sign({ id: User._id, role: User.role }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });};
    /*exports.register = async (req, res) => {try{
        const newUser = await User.create(req.body);
        res.status(201).json({
            message: 'User created successfully',
            success: true,
            data: User,
            token: createToken(User)
        });
        }
    } catch (error) {
        res.status(500).json({
            message: 'Error creating user',
            success: false,
            error: error.message
        });}
    };*/
    export const register =async (req, res) => {
    const { name, email, password, role, sexe, etablissement, dateNaissance, filiere } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
            sexe,
            etablissement,
            dateNaissance,
            filiere
        });
        await newUser.save()
        .then(() => {
            console.log('User created successfully');
        })
        .catch(err => {
            console.error('Error creating user:', err);
        });

        //save user info to session
        req.session.user = {
            email: newUser.email,
            role: newUser.role,
        };
                //redirect to appropriate dashboard based on role
                if (role === 'teacher') {
                    res.redirect('/Tdashboard'); // Redirect to teacher dashboard
                } else {
                    res.redirect('/Sdashboard'); // Redirect to student dashboard
                }
            } catch (error) {
                console.error("register error:", error);
                res.status(500).send('Server error');
            }
        };

export const login = async (req, res) => {
    const { email, password } = req.body;
    try{
        const foundUser=await User.findOne({ email });
        if (!foundUser||!(await bcrypt.compare(password, foundUser.password))) 
            return res.status(401).json({ message: 'Invalid email or password' });
        //compare password with hashed password
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        //save user info to session
        req.session.user = {
            email: foundUser.email,
            role: foundUser.role,
        };
        //redirect to appropriate dashboard based on role
        if (foundUser.role === 'teacher') {
            res.redirect('/Tdashboard'); // Redirect to teacher dashboard
        } else {
            res.redirect('/Sdashboard'); // Redirect to student dashboard
        }
        //create token and set it in cookie 
        const token = createToken(foundUser);
        res.cookie('jwt', token, { httpOnly: true });
        res.status(200).json({
            message: 'Login successful',
            success: true,
            token,
            User

            }
        );
    
    }catch (error) {
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