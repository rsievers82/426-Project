const user_data = require('data-store')({path: process.cwd() + '/data/user.json'})

class User {
    constructor(id, username, password, money) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.money = money;
    }

    update() {
        user_data.set(this.id.toString(), this);
    }

    delete() {
        user_data.del(this.id.toString());
    }
}

User.getAllIDs = () => {
    return Object.keys(user_data.data).map(id => {
        return parseInt(id);
    });
}

User.getAllUsernames = () => {
    let usernames = [];
    let ids = Object.keys(user_data.data);
    ids.forEach(id => {
        usernames.push(user_data.data[id].username);
    });
    return usernames;
}

User.getAllUserInfo = () => {
    let user_info = [];
    
    let ids = Object.keys(user_data.data);
    ids.forEach(id => {
        user_info.push(user_data.data[id]);
    });

    return user_info;
}

User.findByID = (id) => {
    let userData = user_data.get(id);
    if (userData != null) {
        return new User(userData.id, userData.username, userData.password, userData.money);
    }
    return null;
}

User.nextID = User.getAllIDs().reduce((max, next_id) => {
    if (max < next_id) {
        return next_id;
    }
    return max;
}, -1) + 1;

User.create = (username, password) => {
    let id = User.nextID;
    User.nextID += 1;
    let new_user = new User(id, username, password, 5000);
    user_data.set(new_user.id.toString(), new_user);
    return new_user;
}


module.exports = User;