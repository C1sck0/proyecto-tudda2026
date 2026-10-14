import { getDependency } from "../dependency.js";
import checkRoleMiddleware from "../middlewares/check_role_middleware.js";

export function configureAppointmentRouter(router) {
    const AppointmentService = getDependency('appointmentService');

    console.log('Configurando rutas de turnos');

    // Sirve para obtener la lista de turnos (Permitido para admin o barber)
    router.get('/appointments', checkRoleMiddleware(['admin', 'barber', 'user']), async (req, res) => {
        const appointments = await AppointmentService.getList();
        res.json(appointments.map(app => ({
            id: app._id,
            customerName: app.customerName,
            date: app.date,
            proposedDate: app.proposedDate,
            barberUsername: app.barberUsername,
            status: app.status
        })));
    });

    // Sirve para pedir un nuevo turno (Puede hacerlo cualquiera)
    router.post('/appointments', checkRoleMiddleware(['user', 'admin']), async (req, res) => {
        const appointmentData = req.body;
        const newAppointment = await AppointmentService.add(appointmentData);
        res.json({ newAppointment });
    });

    // Sirve para cancelar un turno (Puede hacerlo cualquiera)
router.put('/appointments/:id/cancel', checkRoleMiddleware(['admin', 'user', 'barber']), async (req, res) => {
    try {
        const { id } = req.params;
        const updatedAppointment = await AppointmentService.cancel(id);
        res.json({ message: "Turno cancelado/rechazado con éxito", updatedAppointment });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

    // Sirve para cambiar un turno ya hecho (Permitido para barber y admin)
    router.put('/appointments/:id/propose-move', checkRoleMiddleware(['admin', 'barber']), async (req, res) => {
        try {
            const { id } = req.params;
            const { newDate } = req.body;
            
            const updatedAppointment = await AppointmentService.proposeMove(id, newDate);
            res.json({ message: "Propuesta de cambio enviada", updatedAppointment });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Es para aceptar cambio de fecha (Permitido para admin y user)
    router.put('/appointments/:id/accept-change', checkRoleMiddleware(['admin', 'user']), async (req, res) => {
        try {
            const { id } = req.params;
            const updatedAppointment = await AppointmentService.acceptChange(id);
            res.json({ message: "Cambio de horario aceptado por el cliente", updatedAppointment });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Es para confirmar un turno (Permitido para barber y admin)
    router.put('/appointments/:id/confirm', checkRoleMiddleware(['admin', 'barber']), async (req, res) => {
        try {
            const { id } = req.params;
            const updatedAppointment = await AppointmentService.confirm(id);
            res.json({ message: "Turno confirmado con éxito", updatedAppointment });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
} 