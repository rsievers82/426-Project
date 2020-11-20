const express = require('express');

const app = express();

const cors = require('cors');

const expressSession = require('express-session');

app.use(cors());

app.use(expressSession({
    name: 'BlackjackSessionCookie',
    secret: 'I am ready for break',
    resave: false,
    saveUninitialized: false
}));

const login_data = require('data-store')({path: process.cwd() + '/data/login.json'});

const bodyParser = require('body-parser');
app.use(bodyParser.json());


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

    let {user, password, money} = req.body;

    if (login_data.get(user) && user !== req.session.user) {
        res.status(404).send("Username taken. Try again.");
        return;
    }

    if (password.length < 8) {
        res.status(403).send("Password must be at least 8 characters.");
        return;
    }

    login_data.set(user, {
        user,
        password,
        money
    });

    if (user !== req.params.user) {
        login_data.del(req.params.user);
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
