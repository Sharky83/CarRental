import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../configs/config.js';

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String, 
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String, 
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't include password in queries by default
    },
    role: {
        type: String, 
        enum: {
            values: ["owner", "user"],
            message: 'Role must be either owner or user'
        }, 
        default: 'user'
    },
    image: {
        type: String, 
        default: '',
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    passwordChangedAt: {
        type: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Instance methods
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

userSchema.methods.generateAuthToken = function() {
    return jwt.sign({ id: this._id }, config.jwt.secret, {
        expiresIn: config.jwt.accessExpirationMinutes,
    });
};

userSchema.methods.isPasswordMatch = async function(password) {
    return bcrypt.compare(password, this.password);
};

userSchema.methods.isPasswordChanged = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Pre-save middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, config.bcrypt.rounds);
    
    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000;
    }
    
    next();
});

// Update lastLogin on successful login
userSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save({ validateBeforeSave: false });
};

const User = mongoose.model('User', userSchema);

export default User;