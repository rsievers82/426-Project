const express = require('express');

const app = express();

const cors = require('cors');

const expressSession = require('express-session');

const cors_options = {
    origin: 'http://localhost:3000',
    credentials: true
  }

app.use(cors(cors_options));

app.use(expressSession({
    name: 'BlackjackSessionCookie',
    secret: 'I am ready for break',
    resave: false,
    saveUninitialized: false,
    // proxy: true,
    cookie: {
        secure: false,
        maxAge: 5184000000
    }
}));

const login_data = require('data-store')({path: process.cwd() + '/data/login.json'});

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/users', (req, res) => {
    let users = Object.keys(login_data.data);
    res.json(users);
})

app.get('/users/info', (req, res) => {
    let users = login_data.data;
    res.json(users);
})

app.get('/users/:user', (req, res) => {
    let user = login_data.get(req.params.user);
    res.json(user);
})


app.post('/create', (req, res) => {
    let user = req.body.user;
    let password = req.body.password;
    if (password.length < 8) {
        res.status(403).send("Password must be at least 8 characters. Try Again.");
        return;
    }
    if (login_data.get(user)) {
        res.status(403).send("Username taken. Try Again.");
        return;
    }
    login_data.set(user, {
        user,
        password,
        'money': 5000
    });
    res.json(login_data.get(user));
});


app.post('/login', (req, res) => {
    let user = req.body.user;
    let password = req.body.password;
    let user_data = login_data.get(user);
    if (user_data == null) {
        res.status(404).send("Invalid username");
        return;
    }
    if (user_data.password == password) {
        console.log("User " + user + " credentials valid");
        req.session.user = user;
        res.json(user_data);
        return;
    }
    res.status(403).send("Incorrect password");
});


app.get('/logout', (req, res) => {
    delete req.session.user;
    res.json(true);
})


app.put('/users/:user', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("Login to update account.");
        return;
    }
    let current = (req.params.user);
    if (!login_data.get(current)) {
        res.status(404).send("User Not Found");
        return;
    }
    if (req.params.user !== req.session.user) {
        res.status(403).send("Cannot update another player's account.");
        return;
    }
    let user;
    let password;
    let money;
    req.body.user ? user = req.body.user : user = req.params.user;
    req.body.password ? password = req.body.password : password = login_data.get(req.params.user).password;
    req.body.money ? money = req.body.money : money = login_data.get(req.params.user).money;
    if (login_data.get(user) && user !== req.session.user) {
        res.status(404).send("Username taken. Try again.");
        return;
    }
    if (password.length < 8) {
        res.status(403).send("Password must be at least 8 characters.");
        return;
    }
    if (money < 0) {
        money = 0;
    }
    login_data.set(user, {
        user,
        password,
        money
    });
    if (user !== req.params.user) {
        login_data.del(req.params.user);
        req.session.user = user;
    }
    res.json(login_data.get(user));
});


app.delete('/users/:user', (req, res) => {
    if (req.session.user == undefined) {
        res.status(403).send("Login to delete account");
        return;
    }
    let user = req.params.user;
    if (!login_data.get(user)) {
        res.status(404).send("User Not Found");
        return;
    }
    if (req.session.user != user) {
        res.status(403).send("Cannot delete another players account.");
        return;
    }
    login_data.del(user);
    delete req.session.user;
    res.json(true);
});


app.delete('/users', (req, res) => {
    login_data.clear();
    res.json(true);
    
})


const port = 3030;
app.listen(port, () => {
    console.log("App running on port " + port);
})
