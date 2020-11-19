const express = require('express');

const cors = require('cors');

const app = express();

app.use(cors());

const User = require('./User');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/users', (req, res) => {
    res.json(User.getAllIDs());
    return;
});

app.get('/usernames', (req, res) => {
    res.json(User.getAllUsernames());
    return;
})

app.get('/users/:id', (req, res) => {
    let user = User.findByID(req.params.id);
    if (user == null) {
        res.status(404).send("User Not Found");
        return;
    }

    res.json(user);
    return;
});

app.get('/alluserinfo', (req, res) => {
    res.json(User.getAllUserInfo());
    return;
});

app.post('/users', (req, res) => {
    let {username, password} = req.body;

    let user = User.create(username, password);
    if (user == null) {
        res.status(400).send("Bad Request");
        return;
    }

    return res.json(user);
});

app.put('/users/:id', (req, res) => {
    let user = User.findByID(req.params.id);
    if (user == null) {
        res.status(404).send("User Not Found");
        return;
    }

    let {username, password, money} = req.body;
    user.username = username;
    user.password = password;
    user.money = money;

    user.update();

    res.json(user);
});

app.delete('/users/:id', (req, res) => {
    let user = User.findByID(req.params.id);
    if (user == null) {
        res.status(404).send("User Not Found");
        return;
    }

    user.delete();
    res.json(true);
})


const port = 3030;
app.listen(port, () => {
    console.log("App running on port " + port);
})
