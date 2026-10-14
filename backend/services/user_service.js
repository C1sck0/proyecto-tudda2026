import { getDependency } from '../dependency.js';
import bcrypt from 'bcrypt';

export class UserService {
    constructor(){
        this.userRepo = getDependency('userRepo');
    }
    async getList(){
        return await this.userRepo.find(); // el find es un metodo de mongoose que devuelve todos los documentos de la coleccion
    }
    
    
    async add(user){
        if (!user.username)
            throw new Error('El nombre es obligatorio');

        if (!user.password)
            throw new Error('La contraseña es obligatoria');

        if (user.password == '1234')
            throw new Error('La contraseña no puede ser 1234');

        const existentUser = await this.userRepo.find({ //fin devuelve una lista
            username: user.username
        });
        if (existentUser.length)
            throw new Error('El nombre de usuario ya existe');

        user.password = await bcrypt.hash(user.password, 10);

        return this.userRepo.create(user);
    }
  async deleteByName(name) {
        const user = await this.userRepo.findOne({ username: name });
        if (!user) {
            throw new Error('El usuario no existe');
        }
        return await this.userRepo.deleteOne({ username: name });
    }
    
    async updateByName(name, user) {
        // Reemplazamos getByName por findOne
        const existentUser = await this.userRepo.findOne({ username: name });
        if (!existentUser)
            throw new Error('El usuario no existe');

        if (user.password == '1234')
            throw new Error('La contraseña no puede ser 1234');

        if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
        }

        // Reemplazamos updateByName por updateOne
        return await this.userRepo.updateOne({ username: name }, user);
    } 
}

