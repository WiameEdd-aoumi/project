import Exam from '../models/Exam.js';
const {Exam, Question}=require('../models/Exam.js');
const crypto = require('crypto');
exports.createExam = async (req, res) => {
    try {
        const { title, description, duration, questions } = req.body;
        const examId = crypto.randomBytes(16).toString('hex');
        const exam = await Exam.create({
            title,
            description,
            duration,
            questions,
            examId,
            teacherId: req.user._id,
            accessLink: `https://example.com/exam/${examId}`
        });
        await exam.save();
        res.status(201).json({
            message: 'Exam created successfully',
            success: true,
            data: exam
        }); 
    } 
    catch (error) {
        res.status(500).json({
            message: 'Error creating exam',
            success: false,
            error: error.message
        });
    }
};

exports.addQuestion= async (req, res) => {
    try {
        const { examId, questionType, text, media, options,correctAnswer,directAnswer,tolerance,points,duration,order } = req.body;
        const question = await Question.create({
            examId,
            questionType,
            text,
            media,
            options,
            correctAnswer,
            directAnswer,
            tolerance,
            points,
            duration,
            order
        });
        res.status(201).json({
            message: 'Question added successfully',
            success: true,
            data: question
        });
    } 
    catch (error) {
        res.status(500).json({
            message: 'Error adding question',
            success: false,
            error: error.message
        });
    }
};

/*export const createExam = async (req, res) => {
    const exam = await Exam.create(req.body);
    res.status(201).json({
        message: 'Exam created successfully',
        success: true,
        data: exam
    });
}*/
    export const getExams = async (req, res) => {
        try {
            const exams = await Exam.find({ teacherId: req.user._id });
            res.status(200).json({
                message: 'Exams fetched successfully',
                success: true,
                data: exams
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error fetching exams',
                success: false,
                error: error.message
            });
        }
    };