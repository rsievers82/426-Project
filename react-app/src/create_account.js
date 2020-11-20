import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {Login} from './login';
import axios from 'axios';


export function CreateAccount() {
    const [usernameText, setUsernameText] = useState('');

    const [passwordText, setPasswordText] = useState('');

    function handleChange(event) {
        if (event.target.id === "inputUsername") {
            setUsernameText(event.target.value);
        } else {
            setPasswordText(event.target.value);
        }
    }

    async function handleCreateAccountAttempt(event) {
        event.preventDefault();

        try {
            await axios({
                'method': 'post',
                'url': 'http://localhost:3030/create',
                'data': {
                    'user': usernameText,
                    'password': passwordText
                }
            });
            ReactDOM.render(<Login />, document.getElementById('root'));
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
    <form className="form-signin" onSubmit={handleCreateAccountAttempt}>
        <div className="text-center mb-4">
            <h1 className="h3 mb-3 font-weight-normal">New User Registration</h1>
        </div>

        <div className="form-label-group">
            <input id="inputUsername" className="form-control" placeholder="Username" required autoFocus onChange={handleChange}/>
            <label htmlFor="inputUsername">Username</label>
        </div>

        <div className="form-label-group">
            <input type="password" id="inputPassword" className="form-control" placeholder="Password" required onChange={handleChange}/>
            <label htmlFor="inputPassword">Password</label>
        </div>

        <button className="btn btn-lg btn-primary btn-block" type="submit">Create Account</button>

        <button onClick={handleLoginButtonClick} className="btn btn-lg btn-primary btn-block">Home</button>
        <p className="mt-5 mb-3 text-muted text-center">Created by Randy Sievers, Emily Fallon, Michael Carter</p>
    </form>
    ); 
}