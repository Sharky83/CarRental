import mongoose from "mongoose";
const {ObjectId} = mongoose.Schema.Types

const carSchema = new mongoose.Schema({
    owner: {type: ObjectId, ref: 'User', required: true},
    brand: {type: String, required: true, trim: true},
    model: {type: String, required: true, trim: true},
    image: {type: String, required: true},
    year: {type: Number, required: true, min: 1900, max: new Date().getFullYear() + 1},
    category: {type: String, required: true, trim: true},
    seating_capacity: {type: Number, required: true, min: 1, max: 50},
    fuel_type: { type: String, required: true, trim: true },
    transmission: { type: String, required: true, trim: true },
    pricePerDay: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
    isAvailable: {type: Boolean, default: true}, // Fixed typo: isAvaliable -> isAvailable
    features: [{type: String}], // Array of car features
    rating: {type: Number, default: 0, min: 0, max: 5},
    totalBookings: {type: Number, default: 0}
},{timestamps: true})

// Index for better query performance
carSchema.index({ location: 1, isAvailable: 1 });
carSchema.index({ category: 1, isAvailable: 1 });
carSchema.index({ owner: 1 });

const Car = mongoose.model('Car', carSchema)

export default Car