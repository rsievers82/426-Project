const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const app = express();

const expressSession = require('express-session');

const cors_options = {
    origin: 'true',
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

admin.initializeApp();

const db = admin.firestore();

const usersRef = db.collection('users');


const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.get('/users', async (req, res) => {
    const usersRef = db.collection('users');
    let users = await usersRef.get().data();
    let publicUsers = users.map( record => {record.user})
    res.json(publicUsers);
})

app.get('/users/info', (req, res) => {
    const usersRef = db.collection('users');
    let users =  usersRef.get().data();
    let publicUsers = users.map(record => {record.user, record.money})
    res.json(publicUsers);
})

app.get('/users/:user', (req, res) => {
    const usersRef = db.collection('users');
    let user = usersRef.doc(user).get(req.params.user).data();
    res.json(user);
})


app.post('/create', (req, res) => {
    let user = req.body.user;
    let password = req.body.password;
    if (password.length < 8) {
        res.status(403).send("Password must be at least 8 characters. Try Again.");
        return;
    }
    const usersRef = db.collection('users');
    let existingUser = usersRef.doc(user).get();
    if (existingUser.exists) {
        res.status(403).send("Username taken. Try Again.");
        return;
    }
    usersRef.doc(user).set({
        user,
        password,
        'money': 5000
    });
    /* login_data.set(user, {
        user,
        password,
        'money': 5000
    }); */
    res.json(usersRef.doc(user).get(user).data());
});


app.post('/login', (req, res) => {
    const usersRef = db.collection('users');
    let user = req.body.user;
    let password = req.body.password;
    let user_data = usersRef.doc(user).get(user).data();
    if (user_data) {
        res.status(404).send("Invalid username");
        return;
    }
    if (user_data.password === password) {
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
    if (req.session.user === undefined) {
        res.status(403).send("Login to update account.");
        return;
    }
    const usersRef = db.collection('users');
    let current = usersRef.get(req.params.user);
    if (!current.exists) {
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
    req.body.password ? password = req.body.password : password = current.password;
    req.body.money ? money = req.body.money : money = current.money;
    if (usersRef.doc(user).get().exists && user !== req.session.user) {
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
    usersRef.doc(user).update({
        user,
        password,
        money
    });
    if (user !== req.params.user) {
        usersRef.doc(user).delete();
        req.session.user = user;
    }
    res.json(usersRef.doc(user).get().data());
});


app.delete('/users/:user', (req, res) => {
    if (req.session.user === undefined) {
        res.status(403).send("Login to delete account");
        return;
    }
    let user = req.params.user;
    const usersRef = db.collection('users');
    const currentUser = usersRef.doc(user).get();
    if (currentUser.exists) {
        res.status(404).send("User Not Found");
        return;
    }
    if (req.session.user !== user) {
        res.status(403).send("Cannot delete another players account.");
        return;
    }
    usersRef.doc(user).delete();
    delete req.session.user;
    res.json(true);
});


app.delete('/users', (req, res) => {
    const usersRef = db.collection('users');
    SusersRef.delete();
    res.json(true);
    
})


/* const port = process.env.port || 3030;
app.listen(port, () => {
    console.log("App running on port " + port);
})
 */
exports.app = functions.https.onRequest(app);