// import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';
import { Login } from './login';

export function Leaderboard(props) {
    const players = props.players;

    function handleLoginButtonClick(event) {
        ReactDOM.render(<Login />, document.getElementById('root'));
    }

    const tableRows = players.map(player => {
        return (
            <tr>
                <td>
                    {players.findIndex(p => p.user === player.user) + 1}
                </td>
                <td>
                    {player.user}
                </td>
                <td>
                    {player.money}
                </td>
            </tr>
        )
    });   
    

    return (
        <div>
            <table>
                <thead>
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