import axios from 'axios';
import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {Login} from "./login";

const serverURL= 'http://localhost:3030';

export function Table(props) {
    const username = props.username;
    const money = props.money;

    async function handleLogoutButtonClick(event) {
        //to implement a single source of truth for the server destination
        //if a props is given the Backend, use:
        //"url": this.props.server+"/logout"
        await axios({
            "method": "get",
            "url": serverURL+"/logout"
        });
        ReactDOM.render(<Login />, document.getElementById('root'));
    }

    return (
        <div className="container-fluid">
        {/* <!-- Header --> */}
        <header className="site-header d-flex p-2 justify-content-between">
            <div className="site-title text-center h3">Blackjack - CS 426</div>
            <button className="btn btn-lg btn-primary" onClick={handleLogoutButtonClick}>Logout</button>
        </header>
        {/* <!-- Dealer Area --> */}
        <div className="row d-flex p-2 justify-content-center">
            <div className="card">
                <div className="card-body">
                    <h4 className="card-title text-center username">Dealer</h4>
                    <div className="text-center hand">Temp text</div>
                </div>
            </div>
        </div>
        {/* <!-- Betting Area --> */}
        <div className="row d-flex p-2 justify-content-center">
            <div className="d-flex justify-content-center flex-column col-md-3">
                <div className="card">
                    <div className="card-body">
                        <div className="card-text d-flex justify-content-around">
                            <h4 className="text-center">Currently waiting on <span className = "current-player">Username</span> to act.</h4>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body">
                        <div className="card-text d-flex justify-content-around">
                            <button className="btn btn-lg btn-primary">Hit</button>
                            <button className="btn btn-lg btn-primary">Stand</button>
                            <button className="btn btn-lg btn-primary">Split</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* <!-- Players Area --> */}
        <div className="row fixed-bottom p-2">
            <div className="col-lg-12 d-inline-flex justify-content-around players card-group">

                {/* <!-- sample player card --> */}
                <div className="card">
                    <div className="card-top text-center hand">Look <a
                            href="https://www.htmlsymbols.xyz/games-symbols/playing-cards">here</a> for a list
                        of all Unicode playing cards.</div>
                    <div className="card-body">
                        <h4 className="card-title text-center username">{username}</h4>
                        <p className="card-text text-center bet">
                            Current Bet: $0
                        </p>
                        <p className="card-text text-center money">
                            Total Money: ${money}
                        </p>
                    </div>
                </div>


            </div>
        </div>
        {/* <!-- End Player Area --> */}
    </div>
    )

}
