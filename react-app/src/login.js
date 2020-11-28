import axios from 'axios';
import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {CreateAccount} from './create_account';
// import './floatinglabels.css';
// import './styles.css';
import { App } from "./game";
import { Leaderboard } from './leaderboard';
//server URL in one easy place to change
const serverURL= 'http://localhost:3030';

export function Login() {
    const [usernameText, setUsernameText] = useState('');
    const [passwordText, setPasswordText] = useState('');
    const [message, setMessage] = useState('');

    function handleChange(event) {
        if (event.target.id === "inputUsername") {
            setUsernameText(event.target.value);
        } else {
            setPasswordText(event.target.value);
        }
    }

    async function getLeaderboard() {
        let userInfo = [];        
        let users = await axios({
            method: 'get',
            url: serverURL+'/users/info',
            withCredentials: true
        });
        let keys = Object.keys(users.data);
        keys.forEach(key => {
            userInfo.push(users.data[key]);
        });
        userInfo.sort((a, b) => b.money - a.money);
        ReactDOM.render(<Leaderboard players={userInfo}/>, document.getElementById('root'));
    }

    async function handleLoginAttempt(event) {
        event.preventDefault();

        try {
            let result = await axios({
                method: "post",
                url: serverURL+"/login",
                data: {
                    "user": usernameText,
                    "password": passwordText
                },
                withCredentials: true
            });
            ReactDOM.render(<App username={usernameText} money={result.data.money}/>, document.getElementById('root'));
            return;
        } catch (err) {
            console.log(err);
            setMessage("There was an error logging you in. Double check your username and password.")
        }
    }

    function handleCreateButtonClick(event) {
        ReactDOM.render(<CreateAccount />, document.getElementById('root'));
    }

    return (
    <div>
        <div>
            <form className="form-signin" onSubmit={handleLoginAttempt}>
            <div className="text-center mb-4">
                <h1 className="h3 mb-3 font-weight-normal">Blackjack Login</h1>
            </div>

            <div className="form-label-group">
                <input id="inputUsername" className="form-control" placeholder="Username" required autoFocus onChange={handleChange}/>
                <label htmlFor="inputUsername">Username</label>
            </div>

            <div className="form-label-group">
                <input type="password" id="inputPassword" className="form-control" placeholder="Password" required onChange={handleChange}/>
                <label htmlFor="inputPassword">Password</label>
            </div>

            <p className="text-center error">{message}</p>
            <button className="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
            <p className="mt-3 mb-2 text-center">Don't have an account yet?</p>
            <button onClick={handleCreateButtonClick} className="btn btn-lg btn-primary btn-block">Create Account</button>
            <div>
                <button className="btn btn-lg btn-primary btn-block" onClick={getLeaderboard}>View Leaderboard</button>
            </div>
            <p className="mt-5 mb-3 text-muted text-center">Created by Randy Sievers, Emily Fallon, Michael Carter, John Fulghieri</p>
            </form>
        </div>
    </div>
    )
}