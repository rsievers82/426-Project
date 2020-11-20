import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {Login} from './login';
import axios from 'axios';


export function CreateAccount() {
    const [usernameText, setUsernameText] = useState('');

    const [passwordText, setPasswordText] = useState('');

    function handleChange(event) {
        if (event.target.id === "username") {
            setUsernameText(event.target.value);
        } else {
            setPasswordText(event.target.value);
        }
    }

    async function handleCreateAccountAttempt(event) {
        event.preventDefault();

        try {
            let result = await axios({
                'method': 'post',
                'url': 'http://localhost:3030/create',
                'data': {
                    'user': usernameText,
                    'password': passwordText
                }
            });
            ReactDOM.render(<h2>Account created! Username: {result.data.user} Password: {result.data.password}</h2>, document.getElementById('root'));
            return;
        } catch (err) {
            console.log(err.message);
            ReactDOM.render(<h2>{err.message}</h2>, document.getElementById('root'));
            return;
        }
    }

    function handleLoginButtonClick(event) {
        ReactDOM.render(<Login />, document.getElementById('root'));
    }

    return (
    <div className="createAccount">
        <div className="input">
        <div className="heading">
            <h2>Create An Account</h2>
        </div>
        <form className="container" onSubmit={handleCreateAccountAttempt}>
            <label for="username">New Username</label>
            <input id="username" name="username" value={usernameText} placeholder="Blackjackplayer123" onChange={handleChange} required />
            <label for="password">New Password</label>
            <input id="password" name="password" value={passwordText} placeholder="21isfun" type="password" onChange={handleChange} required />
            <button className="login_button">Create Account</button>
        </form>
        </div>
        <div className="container">
            <p>Already have an account?</p>
            <button onClick={handleLoginButtonClick}>Log in</button>
        </div>
    </div>
    ); 
}