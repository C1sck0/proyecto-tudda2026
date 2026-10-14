export class UserMockup {
    users = [
        { id: 1, name: 'Alice', password: '1234'},
        { id: 2, name: 'Bob', password: '1234'},
        { id: 3, name: 'Charlie', password: '1234'},    
    ];
    constructor() {
    }
    getList(){
        return this.users;
    } 
    add(user){
        user.id = this.users
            .map(u => u.id) //me devuleve un arreglo con los id de los usuarios
            .reduce((a, b) => Math.max(a, b), 0) + 1; //me toma un valor primero y luego lo compara con el valor actual, y devuleve el mayor
        this.users.push(user);
        return user;
    }

    getByName(name){
        return this.users.find(u => u.name === name);

    }
    deleteByName(name){
        const index = this.users.findIndex(u => u.name === name);
        if (index !== -1) {
            this.users.splice(index, 1);
        }
    }

    updateByName(name, user){
        const index = this.users.findIndex(u => u.name === name);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...user };
            return this.users[index];
        }
        return null;
    }   
    
}
