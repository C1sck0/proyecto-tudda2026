import { getDependency } from '../dependency.js';
import bcrypt from 'bcrypt';

export class loginService {
    constructor(){
        this.userRepo = getDependency('userRepo');
        this.sessionRepo = getDependency('sessionRepo');
    }

    createToken(){
        const array = new Uint32Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');  
    }

    async login(data){
        if (!data.username)
            throw new Error('El nombre es obligatorio');

        if (!data.password)
            throw new Error('La contraseña es obligatoria');

        const user = await this.userRepo.findOne({
            username: data.username
        });  

        if (!user)
            throw new Error('Usuario o contraseña incorrectos');

        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch)
            throw new Error('Contraseña incorrecta');

        //if (user.password != data.password)
        //    throw new Error('Contraseña incorrecta');

        var authorizationToken;
        do{ 
            authorizationToken = this.createToken();
        } while (await this.sessionRepo.findOne({authorizationToken}));

        const session = await this.sessionRepo.create({
    username: user.username,
    authorizationToken: authorizationToken,
    open: new Date().toISOString(),
    role: user.role
});

return {
    username: session.username,
    role: session.role,
    authorizationToken: authorizationToken 
};
    }
    
}

