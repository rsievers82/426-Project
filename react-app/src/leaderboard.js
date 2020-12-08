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


    function handleEnter(event) {
        const enter = 13;
        if (event.keyCode === enter) {
            event.preventDefault();
            if (input === "") {
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
                }));
            } else if (usernames.find(u => u === input)) {
                handlePlayerPick({
                    target: {
                        value: input,
                        innerHTML: input
                    }
                });
            }
        }
    }

    function handleLoginButtonClick(event) {
        ReactDOM.render(<Login />, document.getElementById('root'));
    }

    function handleInput(event) {
        setInput(event.target.value);
        setFilteredUsers(usernames.filter(user => user.startsWith(event.target.value)));
    }

    function handlePlayerPick(event) {
        let start;
        let end;
        if (players.findIndex(player => player.user === event.target.innerHTML) <= 3) {
            start = 0
        } else {
            start = players.findIndex(player => player.user === event.target.innerHTML) - 3
        }
        if (players.findIndex(player => player.user === event.target.innerHTML) >= players.length - 3) {
            end = players.length - 1
        } else {
            end = players.findIndex(player => player.user === event.target.innerHTML) + 3
        }
        setFilteredUsers([]);
        setTableRows(
            players.slice(start, end + 1).map(player => {
                if (player.user === event.target.innerHTML) {
                    return (
                        <tr key={player.user} className="text-primary">
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
                } else {
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
                }
                
            })
        );
    }

    const usersFormatted = filteredUsers.map(filteredUser => {
        return (
            <tr className="border border-secondary" key={filteredUser} onClick={handlePlayerPick}>
                <td>{filteredUser}</td>
            </tr>
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
        }));
    }, [players]);


    return (
        <div className="container" onKeyDown={handleEnter}>
            <form className="search" autoComplete="off">
                <input name="search" value={input} id="search" type="text" placeholder="search for a player..." onChange={handleInput}/>
                <table className="table-hover">
                    <tbody>
                        {usersFormatted}
                    </tbody>
                </table>
            </form>
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