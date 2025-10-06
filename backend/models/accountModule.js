const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({

  accountName: {
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
        unique: true,
        ref: 'user',
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required!'],
        trim: true,
        ref: 'user',
        validate: {
            validator: function(v) {
                return /^\+?[\d\s\-\(\)]{10,15}$/.test(v);
            },
            message: 'Please enter a valid phone number'
        }
    }
}, {
  timestamps: true
});

module.exports = mongoose.model("account", accountSchema);
