import mongoose from 'mongoose';
const examSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    subject:{
        type:String,
        required:true
    },
    level:{
        type:String,
        enum:['1ere année','2eme année','3eme année','4eme année','5eme année'],
        required:true
    },
    date:{
        type:Date,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    questionsCount:{
        type:Number,
        required:true
    },
    examType:{
        type:String,
        enum:['direct','qcm'],
        required:true
    },
    media:{
        type:String,
        required:false
    },
    createdat:{
        type:Date,
        default:Date.now
    },
    createdby:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    accessLink:{
        type:String,
        unique:true
    },
    teacherId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
    });
    const QuestionSchema=new mongoose.Schema({
        examId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Exam',
            required:true
        },
        questionType:{
            type:String,
            enum:['direct','qcm',],
            required:true
        },
        text:{
            type:String,
            required:true
        },
        media:{
            type:String,
            required:false
        },
        options:{
            type:Map,
            of:String,
            required:function() {
                return this.questionType === 'qcm';
            }
        },
        correctAnswer:{
            type:String,
            required: function() {
                return this.questionType === 'qcm';
            }
        },
        directAnswer:{
            type:String,
            required:function() {
                return this.questionType === 'direct';
            }
        },
        tolerance:{
            type:Number,
            required:function() {
                return this.questionType === 'direct';
            }
        },
        points:{
            type:Number,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        order:{
            type:Number,
            required:true
        },
    });
    const studentSchema=new mongoose.Schema({
        examId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Exam',
            required:true
        },
        studentId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        score:{
            type:Number,
            default:0
        },
        status:{
            type:String,
            enum:['pending','completed'],
            default:'pending'
        },
        answers:{
            type:[String],
            required:true
        },
        startTime:{
            type:Date,
            required:true
        },
        endTime:{
            type:Date,
            required:true
        }
    });
    const Exam = mongoose.model('Exam', examSchema);
    const Question = mongoose.model('Question', QuestionSchema);
    const Student = mongoose.model('Student', studentSchema);

export { Exam, Question, Student };


   