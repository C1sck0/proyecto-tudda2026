import { getDependency } from '../dependency.js';

export class NotificationService {
    constructor() {
        this.notificationRepo = getDependency('notificationRepo');
    }

    // Sirve para crear una nueva notificación
    async create({ username, title, message, appointmentId }) {
        return await this.notificationRepo.create({
            username,
            title,
            message,
            appointmentId
        });
    }

    // Sirve para obtener las notificaciones no leídas de un usuario específico
    async getActiveByUser(username) {
        return await this.notificationRepo.find({ username, read: false }).sort({ createdAt: -1 });
    }

    // Sirve para marcar una notificación como leída
    async markAsRead(id) {
        return await this.notificationRepo.findByIdAndUpdate(id, { read: true }, { new: true });
    }
}