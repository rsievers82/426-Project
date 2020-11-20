export function Blackjack() {



    return (
        <div class="container-fluid">
                {/* <!-- Header --> */}
                <header class="site-header d-flex p-2 justify-content-between">
                    <div class="site-title text-center h3">Blackjack - CS 426</div>
                    <button class="btn btn-lg btn-primary">Exit</button>
                </header>
                {/* <!-- Dealer Area --> */}
                <div class="row d-flex p-2 justify-content-center">
                    <div class="card">
                        <div class="card-body">
                            <h4 class="card-title text-center username">Dealer</h4>
                            <div class="text-center hand">Temp text</div>
                        </div>
                    </div>
                </div>
                {/* <!-- Betting Area --> */}
                <div class="row d-flex p-2 justify-content-center">
                    <div class="d-flex justify-content-center flex-column col-md-3">
                        <div class="card">
                            <div class="card-body">
                                <div class="card-text d-flex justify-content-around">
                                    <h4 class="text-center">Currently waiting on <span class = "current-player">Username</span> to act.</h4>
                                </div>
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-body">
                                <div class="card-text d-flex justify-content-around">
                                    <button class="btn btn-lg btn-primary">Hit</button>
                                    <button class="btn btn-lg btn-primary">Stand</button>
                                    <button class="btn btn-lg btn-primary">Split</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        
                {/* <!-- Players Area --> */}
                <div class="row fixed-bottom p-2">
                    <div class="col-lg-12 d-inline-flex justify-content-around players card-group">
        
                        {/* <!-- sample player card --> */}
                        <div class="card">
                            <div class="card-top text-center hand">Look <a
                                    href="https://www.htmlsymbols.xyz/games-symbols/playing-cards">here</a> for a list
                                of all Unicode playing cards.</div>
                            <div class="card-body">
                                <h4 class="card-title text-center username">Username</h4>
                                <p class="card-text text-center bet">
                                    Current Bet: $
                                </p>
                                <p class="card-text text-center money">
                                    Total Money: $
                                </p>
                            </div>
                        </div>
        
        
                    </div>
                </div>
                {/* <!-- End Player Area --> */}
            </div>
        )        
}

