import axios from 'axios';
import React, {useState} from 'react';
import { Login } from './login';

export async function Leaderboard() {
    let userInfo = [];

    let users = await axios({
        method: 'get',
        url: 'http://localhost:3030/users',
        withCredentials: true
    });

    users.map(user => {
        let user = await axios({
            method: 'get',
            url: `http://localhost:3030/users/${user}`,
            withCredentials: true
        });
        userInfo.push({
            user: user.data.user,
            money: user.data.money
        });
    });

    return (
        <table>
            <thead>
                <tr>
                    <td>
                        User
                    </td>
                    <td>
                        Money
                    </td>
                </tr>
            </thead>
            <tbody>
                {
                    userInfo.forEach(user => {
                        <tr>
                            <td>
                                {user.user}
                            </td>
                            <td>
                                {user.money}
                            </td>
                        </tr>
                    })
                }
            </tbody>
        </table>
    )
}