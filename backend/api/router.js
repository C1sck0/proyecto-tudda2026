import { configureUserRouter } from './user_router.js';
import { configureLoginRouter } from './login_router.js';
import { configureAppointmentRouter } from './appointment_router.js';
import { configureNotificationRouter } from './notification_router.js'; // <-- 1. Importamos las notificaciones

export function configureRouter(router){
    console.log('Configurando rutas..')
    configureUserRouter(router);
    configureLoginRouter(router);
    configureAppointmentRouter(router);
    configureNotificationRouter(router); 
}