import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Login } from './login';




export class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      deck: null,
      deckRemaining: null,
      dealer: null,
      player: null,
      wallet: this.props.money,
      inputValue: '',
      currentBet: null,
      gameOver: false,
      message: null,
      serverURL: 'http://localhost:3030'
    };
    //this.props.serverURL
    //'http://localhost:5001/blackjackc426project/us-central1/app'
  }

  handleLogoutButtonClick(event) {
    axios({
      "method": "get",
      "url": this.state.serverURL+"/logout"
  });
  ReactDOM.render(<Login />, document.getElementById('root'));
  }

  async generateDeck(){
    let result = await axios({
      'method': 'get',
      'url': 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6'
    });
    return {deckID: result.data.deck_id, remainder: result.data.remaining};
  }

  async dealCards() {
    let initialDraw = await axios({
      'method': 'get',
      'url': `https://deckofcardsapi.com/api/deck/${this.state.deck}/draw/?count=3`
    });

    const [playerCard1, dealerCard1, playerCard2] = [...initialDraw.data.cards];
    const playerStartingHand = [playerCard1, playerCard2];
    const dealerStartingHand = [dealerCard1];

    const player = {
      cards: playerStartingHand,
      count: this.getCount(playerStartingHand)
    };
    const dealer = {
      cards: dealerStartingHand,
      count: this.getCount(dealerStartingHand)
    };
    dealerStartingHand.push({image:"https://cdn.shopify.com/s/files/1/0200/7616/products/playing-cards-bicycle-rider-back-1_1024x1024.png?v=1535755695", value: null, suit:"BACK", code:"0R"});


    return {remainder: initialDraw.data.remaining, player:player, dealer:dealer };
  }

  async startNewGame(type) {
    if (type === 'continue') {
      if (this.state.wallet > 0) {

        if(this.state.deckRemaining < 10){
          await axios({
            method: 'get',
            url: `https://deckofcardsapi.com/api/deck/${this.state.deck}/shuffle/`
          });
        };

        const {remainder, player, dealer } = await this.dealCards();
                
        this.setState({
          deckRemaining: remainder,
          dealer: dealer,
          player: player,
          currentBet: null,
          gameOver: false,
          message: null
        });
        
      } else {
        this.setState({
          message: 'Game over! You are broke!',
          gameOver: true
        });
      }
    } else {
      if (this.state.wallet > 0) {
        const {deckID} = await this.generateDeck();
        this.setState({ deck:deckID });
  
        const {remainder, player, dealer } = await this.dealCards();
  
        this.setState({
          deck: deckID,
          deckRemaining: remainder,
          dealer: dealer,
          player: player,
          inputValue: '',
          currentBet: null,
          gameOver: false,
          message: null
        });  
      } else {
        this.setState({ gameOver: true, message: "Game over! You are broke!" });
      }
      
    }
  }

  async placeBet() {
    const currentBet = this.state.inputValue;

    if (currentBet <= 0) {
      this.setState({ message: 'Bet must be greater than $0.' });
    } else if (currentBet > this.state.wallet) {
      this.setState({ message: 'Insufficient funds to bet that amount.' });
    } else if (currentBet % 1 !== 0) {
      this.setState({ message: 'Please bet whole numbers only.' });
    } else if (typeof this.state.inputValue !== 'number') {
      this.setState({ message: 'Bet must be a number.' });
    } else {
      // Deduct current bet from wallet
      let result = await axios({
        method: 'put',
        url: `${this.state.serverURL}/users/${this.props.username}`,
        withCredentials: true,
        data: {
          'money': this.state.wallet - currentBet
        }
      });
      this.setState({ wallet: result.data.money, inputValue: '', currentBet });

      if (this.getCount(this.state.player.cards) === 21) {
        let result = await axios({
          method: 'put',
          url: `${this.state.serverURL}/users/${this.props.username}`,
          withCredentials: true,
          data: {
            'money': this.state.wallet + this.state.currentBet * 3
          }
        });
        this.setState({
          message: "Blackjack!",
          wallet: result.data.money
        });
        setTimeout(() => {
          this.startNewGame("continue")
        }, 4000);
      }
    }
    this.setState({ message: '' });
  }

  async hit() {
    if (!this.state.gameOver) {
      if (this.state.currentBet) {
        let newCard = await axios({
          'method': 'get',
          'url': `https://deckofcardsapi.com/api/deck/${this.state.deck}/draw/?count=1`
        });
        const player = this.state.player;
        player.cards.push(newCard.data.cards[0]);
        player.count = this.getCount(player.cards);

        if (player.count === 21) {
          this.setState({ message: "Blackjack!" });
          this.stand();
        } else if (player.count > 21) {
          this.setState({ player, message: 'BUST!' });
          await axios({
            method: 'put',
            url: `${this.state.serverURL}/users/${this.props.username}`,
            withCredentials: true,
            data: {
              "money": this.state.wallet
            }
          });

          setTimeout(() => {
            this.startNewGame('continue');
          }, 4000);
        } else {
          this.setState({ player });
        }
      } else {
        this.setState({ message: 'Please place your bet.' });
      }
    } else {
      this.setState({ message: 'You are out of money.' });
    }
  }


  async doubleDown() {
    if (!this.state.gameOver) {
      if (this.state.currentBet) {
        if (this.state.player.cards.length === 2) {
          let currentBet = this.state.currentBet;
          let result = await axios({
            method: 'put',
            url: `${this.state.serverURL}/users/${this.props.username}`,
            withCredentials: true,
            data: {
              'money': this.state.wallet - currentBet
            }
          });
          currentBet *= 2;
          this.setState({ 
            wallet: result.data.money, 
            currentBet 
          });
          await this.hit();
          if (this.getCount(this.state.player.cards) < 21) {
            this.stand();
          }
        } else {
          this.setState({ message: "You cannot double down now." });
        }
      } else {
        this.setState({ message: "Please place your bet." })
      }
    } else {
      this.setState({ message: "You are out of money." })
    }
  }

  async dealerDraw(dealer, deck) {
    const dealerDraw = await axios({
      method: 'get',
      url: `https://deckofcardsapi.com/api/deck/${deck}/draw/?count=1`
    });
    const updatedDeck = dealerDraw.data.deck_id;
    dealer.cards.push(dealerDraw.data.cards[0]);
    dealer.count = this.getCount(dealer.cards);
    
    return {dealer, updatedDeck};
  }

  getCount(cards) {
    const rearranged = [];
    cards.forEach(card => {
      if(card !== "undefined"){
        if (card.code.split("")[0] === 'A') {
          rearranged.push(card);
        } else if (card.code.split("")[0]) {
          rearranged.unshift(card);
      };
    }
    });

    return rearranged.reduce((total, card) => {
      if (card.code.split("")[0] === 'J' || card.code.split("")[0] === 'Q' || card.code.split("")[0] === 'K' || (card.code.split("")[0] === '0' && card.code.split("")[1] !== 'R')) {
        return total + 10;
      } else if (card.code.split("")[0] === 'A') {
        return (total + 11 <= 21) ? total + 11 : total + 1;
      } else {
        return total + Number(card.code.split("")[0]);
      }
    }, 0);
  }

  async stand() {
    if (!this.state.gameOver) {
      if (this.state.currentBet) {
          // Show dealer's 2nd card
          const dealerCard = await axios({
            'method': 'get',
            'url': `https://deckofcardsapi.com/api/deck/${this.state.deck}/draw/?count=1`
          });
          const remainder = dealerCard.data.remaining;
          let deck = dealerCard.data.deck_id;
          let dealer = this.state.dealer;
          dealer.cards.pop();
          dealer.cards.push(dealerCard.data.cards[0]);
          dealer.count = this.getCount(dealer.cards);

          // Keep drawing cards until count is 17 or more
          while (dealer.count < 17) {
            const draw = await this.dealerDraw(dealer, deck);
            dealer = draw.dealer;
            deck = draw.updatedDeck;
          }

          if (dealer.count > 21) {
            let result = await axios({
              method: 'put',
              url: `${this.state.serverURL}/users/${this.props.username}`,
              withCredentials: true,
              data: {
                "money": this.state.wallet + this.state.currentBet * 2
              }
            });
            this.setState({
              deckRemaining: remainder,
              dealer,
              wallet: result.data.money,
              message: 'Dealer bust! You win!'
            });

          } else {
            const winner = this.getWinner(dealer, this.state.player);
            let wallet = this.state.wallet;
            let message;

            if (winner === 'dealer') {
              message = 'Dealer wins...';
            } else if (winner === 'player') {
              let result = await axios({
                method: 'put',
                url: `${this.state.serverURL}/users/${this.props.username}`,
                withCredentials: true,
                data: {
                  "money": this.state.wallet + this.state.currentBet * 2
                }
              });
              wallet = result.data.money;
              message = 'You win!';
            } else {
              let result = await axios({
                method: 'put',
                url: `${this.state.serverURL}/users/${this.props.username}`,
                withCredentials: true,
                data: {
                  "money": this.state.wallet + this.state.currentBet
                }
              });
              wallet = result.data.money;
              message = 'Push.';
            }

            this.setState({
              deckRemaining: remainder,
              dealer,
              wallet,
              message
            });

          }
          setTimeout(() => {
            this.startNewGame();
          }, 4000);
      } else {
        this.setState({ message: "Please place your bet." });
      }
    } else {
      this.setState({ message: 'You have no money!' });
    }
  }

  getWinner(dealer, player) {
    if (dealer.count > player.count) {
      return 'dealer';
    } else if (dealer.count < player.count) {
      return 'player';
    } else {
      return 'push';
    }
  }

  inputChange(e) {
    const inputValue = +e.target.value;
    this.setState({ inputValue });
  }

  handleKeyDown(e) {
    const enter = 13;
    if (e.keyCode === enter) {
      this.placeBet();
    }
  }

  componentWillMount() {
    this.startNewGame();
    const body = document.querySelector('body');
    body.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  render() {
    return (
      <div className="container-fluid">
      {/* <!-- Header --> */}
      <header className="site-header d-flex p-2 justify-content-between">
          <div className="site-title text-center h3">Blackjack - CS 426</div>
          <button className="btn btn-lg btn-primary" onClick={this.handleLogoutButtonClick.bind(this)}>Logout</button>
      </header>
      {/* <!-- Dealer Area --> */}
      <div className="row d-flex p-2 justify-content-center">
          <div className="card">
              <div className="card-body">
                  <h4 className="card-title text-center username">Dealer</h4>
                  <div className="text-center hand">
                      {
                        this.state.currentBet ?
                          <div>
                            {this.state.dealer.cards.map((card, i) => {
                              return <img key={i} src={card.image} width="65" height="100" alt={`${card.value} of ${card.suit}`}/>
                              //return <Card key={i} number={card.code.split("")[0]} suit={card.suit} />;
                             })}
                            <p>({this.state.dealer.count})</p>
                          </div>
                        
                        : null
                      }
                  </div>
              </div>
          </div>
      </div>
      {/* <!-- Betting Area --> */}
      <div className="row d-flex p-2 justify-content-center">
          <div className="d-flex justify-content-center flex-column col-md-3">
              <div className="card">
                  <div className="card-body">
                      <div className="card-text d-flex justify-content-around">
                          {
                            (!this.state.currentBet && !this.state.gameOver) ?
                            <div className="field has-addons">
                              <div className="control">
                                <input className="input" type="text" value={this.state.inputValue} onChange={this.inputChange.bind(this)} />
                              </div>
                              <div className="control">
                              <button className="button is-warning" onClick={() => { this.placeBet() }}>Place Bet</button>
                              </div>
                            </div>
                            : null
                          }
                          {
                            this.state.message ?
                              <h6 className="mt-6 text-center">{this.state.message}</h6>
                            : null
                          }                      
                      </div>
                  </div>
              </div>
              <div className="card">
                  <div className="card-body">
                      <div className="card-text d-flex justify-content-around">
                          <button className="btn btn-lg btn-primary" onClick={this.hit.bind(this)}>Hit</button>
                          <button className="btn btn-lg btn-primary" onClick={this.stand.bind(this)}>Stand</button>
                          <button className="btn btn-lg btn-primary" onClick={this.doubleDown.bind(this)}>Double Down</button>
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
                  <div className="card-top text-center hand">
                      {
                        this.state.currentBet ?
                          <div className="cards">
                            {this.state.player.cards.map((card, i) => {
                              return <img key={i} src={card.image} width="65" height="100" alt={`${card.value} of ${card.suit}`}/>
                              //return <Card key={i} number={card.number} suit={card.suit} />
                            })}
                              ({this.state.player.count})
                          </div>
                        : null
                      }
                  </div>
                  <div className="card-body">
                      <h4 className="card-title text-center username">{this.props.username}</h4>
                      <p className="card-text text-center bet">
                          Current Bet: ${this.state.currentBet}
                      </p>
                      <p className="card-text text-center money">
                          Total Money: ${this.state.wallet}
                      </p>
                  </div>
              </div>


          </div>
      </div>
      {/* <!-- End Player Area --> */}
  </div>
    );
  }
};