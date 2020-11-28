// import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Login } from './login';

export function Leaderboard(props) {

    const players = props.players;
    const usernames = players.map(player => player.user).sort();


    const [input, setInput] = useState('');

    const [filteredUsers, setFilteredUsers] = useState([]);

    const [tableRows, setTableRows] = useState([]);




    function handleLoginButtonClick(event) {
        ReactDOM.render(<Login />, document.getElementById('root'));
    }

    function handleInput(event) {
        setInput(event.target.value);
        setFilteredUsers(usernames.filter(user => user.startsWith(event.target.value)));
    }

    function handlePlayerPick(event) {
        setTableRows(players.slice(players.findIndex(player => player.user === event.target.innerHTML)).map(player => {
            return (
                <tr key={player.user}>
                    <td>
                        {players.findIndex(p => p.user === player.user) + 1}
                    </td>
                    <td>
                        {player.user}
                    </td>
                    <td>
                        ${player.money}
                    </td>
                </tr>
            )
        }));
    }

    const usersFormatted = filteredUsers.map(filteredUser => {
        return (
            <div key={filteredUser} onClick={handlePlayerPick}>
                {filteredUser}
            </div>
        )
    })

    useEffect(() => {
    setTableRows(players.map(player => {
        return (
            <tr key={player.user}>
                <td>
                    {players.findIndex(p => p.user === player.user) + 1}
                </td>
                <td>
                    {player.user}
                </td>
                <td>
                    ${player.money}
                </td>
            </tr>
        )
    }))
    }, [players]);


    return (
        <div>
            <div className="search">
                <input name="search" value={input} id="search" type="text" placeholder="search for a player..." onChange={handleInput}/>
                <div className="options">
                    {usersFormatted}
                </div>
            </div>
            <table className="table table-hover">
                <thead className='thead-light'>
                    <tr>
                        <td>

                        </td>
                        <td>
                            User
                        </td>
                        <td>
                            Money
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {tableRows}
                </tbody>
            </table>
            <button className="btn btn-lg btn-primary btn-block" onClick={handleLoginButtonClick}>Home</button>
        </div>
    )
}