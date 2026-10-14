import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    username: { type: String, required: true }, // Es el cliente que saco el turno
    title: { type: String, required: true },    // Ej: "Propuesta de cambio de turno para x dia"
    message: { type: String, required: true },  // Ej: "Tu barbero Fede propuso..."
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'appointments', required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('notifications', notificationSchema); 