const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required!'],
        trim: true,
        minlength: [2, 'Full name must have at least 2 characters'],
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required!'],
        trim: true,
        minlength: [5, "Email must have 5 char"],
        lowercase: true,
    },
    accountID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        trim:true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required!'],
        trim: true,
        validate: {
            validator: function(v) {
                return /^\+?[\d\s\-\(\)]{10,15}$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    },
    password: {
        type: String,
        required: [true, "Password must be provided"],
        trim: true,
        select: false
    },
    role: {
        type: String,
        enum: {
            values: ['superadmin', 'owner', 'districtmanager','generalmanager'],
            message: 'Position must be either superadmin, owner, or district manager'
        },
        lowercase: true
    },
    superadminsID: [
        {
            type: mongoose.Schema.Types.ObjectId,
        } 
    ],
    ownerID: [
        {
            type: mongoose.Schema.Types.ObjectId,
        } 
    ],
    districtmanagerID: [
        {
            type: mongoose.Schema.Types.ObjectId,
        } 
    ],
    generalmanagerID: [
        {
            type: mongoose.Schema.Types.ObjectId,
        } 
    ],
    restaurantID: [
        {
            type: String,
            ref: 'restaurant' 
        } 
    ],
    verified: {
        type: Boolean,
        default: false,
    },
    verificationCode: {
        type: String,
        select: false,
    },
    verificationCodeValidation: {
        type: Number,
        select: false
    },
    forgotPasswordCode: {
        type: String,
        select: false
    },
    forgotPasswordCodeValidation: {
        type: Number,
        select: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('user', userSchema)