import { addDependency } from './dependency.js';
import { UserService } from './services/user_service.js';
import { loginService } from './services/login_service.js';
import { SessionService } from './services/session_service.js';
import UserMongo from './mongo-db/user_mongo.js';
import sessionMongo from './mongo-db/session_mongo.js'; 
import AppointmentMongo from './mongo-db/appointment_mongo.js';
import { AppointmentService } from './services/appointment_service.js';
import NotificationMongo from './mongo-db/notification_mongo.js';
import { NotificationService } from './services/notification_service.js';

// Repositorios
addDependency('userRepo', UserMongo);
addDependency('sessionRepo', sessionMongo);
addDependency('appointmentRepo', AppointmentMongo);
addDependency('notificationRepo', NotificationMongo); 
addDependency('appointmentService', new AppointmentService());
addDependency('notificationService', new NotificationService());
addDependency('userService', new UserService());
addDependency('loginService', new loginService());
addDependency('sessionService', new SessionService());