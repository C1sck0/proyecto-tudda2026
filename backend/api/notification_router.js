import { getDependency } from "../dependency.js";
import checkRoleMiddleware from "../middlewares/check_role_middleware.js";

export function configureNotificationRouter(router) {
    const NotificationService = getDependency('notificationService');

    console.log('Configurando rutas de notificaciones');

    // Es para obtener notificaciones no leidas
    router.get('/notifications', checkRoleMiddleware(['user', 'admin']), async (req, res) => {
        try {
            const username = req.session?.username || req.user?.username; 
            
            if (!username) {
                throw new Error('No se pudo identificar al usuario logueado');
            }

            const notifications = await NotificationService.getActiveByUser(username);
            res.json(notifications);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Es para marcar una notificación como leída o archivada
    router.put('/notifications/:id/read', checkRoleMiddleware(['user', 'admin']), async (req, res) => {
        try {
            const { id } = req.params;
            await NotificationService.markAsRead(id);
            res.json({ message: "Notificación archivada con éxito" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
}