import axios from 'axios';
import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {CreateAccount} from './create_account';
// import './floatinglabels.css';
// import './styles.css';
// import {Table} from './table';
import { App } from "./game";
import { Leaderboard } from './leaderboard';

export function Login() {
    const [usernameText, setUsernameText] = useState('');

    const [passwordText, setPasswordText] = useState('');

    function handleChange(event) {
        if (event.target.id === "inputUsername") {
            setUsernameText(event.target.value);
        } else {
            setPasswordText(event.target.value);
        }
    }

    async function getLeaderboard() {
        ReactDOM.render(<Leaderboard />, document.getElementById('root'));
    }

    async function handleLoginAttempt(event) {
        event.preventDefault();

        try {
            await axios({
                method: "post",
                url: "http://localhost:3030/login",
                data: {
                    "user": usernameText,
                    "password": passwordText
                },
                withCredentials: true
            }).then(response => ReactDOM.render(<App username={usernameText} money={response.data.money}/>, document.getElementById('root')));
            
            return;
        } catch (err) {
            console.log(err);
            return <h2>Error</h2>;
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

            <button className="btn btn-lg btn-primary btn-block" type="submit">Sign in</button>
            <p className="mt-3 mb-2 text-center">Don't have an account yet?</p>
            <button onClick={handleCreateButtonClick} className="btn btn-lg btn-primary btn-block">Create Account</button>
            <p className="mt-5 mb-3 text-muted text-center">Created by Randy Sievers, Emily Fallon, Michael Carter</p>
            </form>
        </div>
        <div>
            <button className="btn btn-lg btn-primary btn-block" onClick={getLeaderboard}>View Leaderboard</button>
        </div>
    </div>
    )
}