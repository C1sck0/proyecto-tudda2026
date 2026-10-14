import { getDependency } from '../dependency.js';

export class AppointmentService {
    constructor() {
        this.appointmentRepo = getDependency('appointmentRepo');
    }

    async getList() {
        return await this.appointmentRepo.find();
    }

    async add(appointment) {
        if (!appointment.customerName)
            throw new Error('El nombre del cliente es obligatorio');

        if (!appointment.date)
            throw new Error('La fecha y hora son obligatorias');

        if (!appointment.barberUsername)
            throw new Error('Debe seleccionar un barbero');

        // Sirve para verificar que el barbero exista y sea rol 'barber'
        const userRepo = getDependency('userRepo');
        const barber = await userRepo.findOne({ 
            username: appointment.barberUsername, 
            role: 'barber' 
        });

        if (!barber) {
            throw new Error('El barbero seleccionado no existe o no tiene los permisos adecuados');
        }


        // Sirve para verificar si ya hay un turno para esa fecha
        const existentAppointment = await this.appointmentRepo.findOne({
            barberUsername: appointment.barberUsername,
            date: appointment.date,
            status: { $ne: 'cancelled' } 
        });

        if (existentAppointment)
            throw new Error('El barbero ya tiene un turno asignado en ese horario');

        return await this.appointmentRepo.create(appointment);
    }

    // Sirve para confirmar un turno pendiente (Solo lo hace el barbero o admin)
    async confirm(id) {
        const appointment = await this.appointmentRepo.findById(id);
        if (!appointment) throw new Error('El turno no existe');
        
        if (appointment.status !== 'pending') {
            throw new Error('Solo se pueden confirmar turnos que estén en estado pendiente');
        }

        appointment.status = 'confirmed';
        return await appointment.save();
    }
    
    // Sirve para cancelar un turno (Pasa a estado "cancelled")
    async cancel(id) {
        const appointment = await this.appointmentRepo.findById(id);
        if (!appointment) throw new Error('El turno no existe');

        appointment.status = 'cancelled';
        return await appointment.save();
    }

    // Sirve para que el barbero proponga una nueva fecha u hora
    async proposeMove(id, newDate) {
        const appointment = await this.appointmentRepo.findById(id);
        if (!appointment) throw new Error('El turno no existe');

        const isOccupied = await this.appointmentRepo.findOne({
            barberUsername: appointment.barberUsername,
            date: newDate,
            status: { $ne: 'cancelled' } 
        });

        if (isOccupied) {
            throw new Error('El barbero ya tiene un turno asignado en ese nuevo horario propuesto');
        }

        appointment.proposedDate = newDate;
        appointment.status = 'proposed_change';
        
        await appointment.save();


        // Enviar notificación al cliente sobre la propuesta de cambio
        const notificationService = getDependency('notificationService');
        if (notificationService) {
            await notificationService.create({
                username: appointment.customerName,
                title: "Propuesta de cambio de turno recibida",
                message: `Tu barbero ${appointment.barberUsername} propuso mover tu turno al ${newDate}. ¿Aceptás el cambio?`,
                appointmentId: appointment._id
            });
            console.log(`[NOTIFICACIÓN] Creada con éxito para el cliente: ${appointment.customerName}`);
        } else {
            console.log(`[NOTIFICACIÓN] No se pudo enviar: 'notificationService' no está registrado.`);
        }

        return appointment;
    }

    // Sirve para que el cliente acepte el cambio de horario
    async acceptChange(id) {
        const appointment = await this.appointmentRepo.findById(id);
        if (!appointment) throw new Error('El turno no existe');
        if (appointment.status !== 'proposed_change') {
            throw new Error('Este turno no tiene ninguna propuesta de cambio pendiente');
        }

        appointment.date = appointment.proposedDate;
        appointment.proposedDate = null;
        appointment.status = 'confirmed';

        return await appointment.save();
    }
}