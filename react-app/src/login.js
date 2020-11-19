import axios from 'axios';
import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {CreateAccount} from './create_account';

export function Login() {
    const [usernameText, setUsernameText] = useState('');


    const [passwordText, setPasswordText] = useState('');

    function handleChange(event) {
        if (event.target.id === "username") {
            setUsernameText(event.target.value);
        } else {
            setPasswordText(event.target.value);
        }
    }

    async function handleLoginAttempt(event) {
        event.preventDefault();
        let user_info = await axios({
            'method': 'get',
            'url': 'http://localhost:3030/alluserinfo'
        });
        
        for (let i = 0; i < user_info.data.length; i++) {
            if (user_info.data[i].username === usernameText) {
                if (user_info.data[i].password === passwordText) {
                    ReactDOM.render(<h2>Success! Logged in.</h2>, document.getElementById('root'));
                    return;
                } else {
                    ReactDOM.render(<h2>Incorrect Password. Try Again.</h2>, document.getElementById('root'));
                    return;
                }
            }
        }
        ReactDOM.render(<h2>Username does not exist.</h2>, document.getElementById('root'));
        return;
    }

    function handleCreateButtonClick(event) {
        ReactDOM.render(<CreateAccount />, document.getElementById('root'));
    }

    return (
    <div>
        <header className="heading">
            <h2>Blackjack</h2>
            <p>Try to get 21, but don't go over!</p>
        </header>
        <div className="input">
            <form className="container" onSubmit={handleLoginAttempt}>
                <label for="username">Username</label>
                <input id="username" name="username" value={usernameText} placeholder="Blackjackplayer123"  onChange={handleChange} required />
                <label for="password">Password</label>
                <input id="password" name="password" value={passwordText} placeholder="21isfun" type="password" onChange={handleChange} required />
                <button className="login_button">Login</button>
            </form>
        </div>
        <div className="container">
            <p>Don't have an account?</p>
            <button onClick={handleCreateButtonClick}>Create one!</button>
        </div>
    </div>
    )
}