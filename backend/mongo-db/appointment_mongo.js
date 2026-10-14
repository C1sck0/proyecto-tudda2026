import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    customerName: { type: String, required: true },
    date: { type: String, required: true }, // Fecha y hora original
    proposedDate: { type: String, default: null }, // Nueva fecha que puede proponer el barbero
    barberUsername: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'proposed_change', 'confirmed', 'cancelled'], 
        default: 'pending' 
    }
});

export default mongoose.model('appointments', appointmentSchema);