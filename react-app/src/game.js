// import reactBulmaComponents from 'reactBulmaComponents';
import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Login } from './login';
import { get } from 'jquery';
// import './game.css';



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
      splitHand: null,
      serverURL: this.props.this.state.serverURL
    };
    
  }

  handleLogoutButtonClick(event) {
    axios({
      "method": "get",
      "url": this.state.serverURL+"/logout"
  });
  ReactDOM.render(<Login />, document.getElementById('root'));
  }

/*   generateDeck() {
    const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
    const suits = ['♦', '♣', '♥', '♠'];
    const deck = [];
    for (let i = 0; i < cards.length; i++) {
      for (let j = 0; j < suits.length; j++) {
        deck.push({ number: cards[i], suit: suits[j] });
      }
    }
    return deck;
  } */
  async generateDeck(){
    let result = await axios({
      'method': 'get',
      'url': 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6'
    });
    return {deck: result.data.deck_id, remaining: result.data.remaining};
  }

  async dealCards() {
    let draw = await axios({
      'method': 'get',
      'url': `https://deckofcardsapi.com/api/deck/${this.state.deck}/draw/?count=3`
    });

    const {playerCard1, dealerCard1, playerCard2} = [...draw.data.cards];
    /* const playerCard1 = this.getRandomCard(deck);
    const dealerCard1 = this.getRandomCard(playerCard1.updatedDeck);
    const playerCard2 = this.getRandomCard(dealerCard1.updatedDeck); */
    const playerStartingHand = [playerCard1, playerCard2];
    const dealerStartingHand = [dealerCard1, {}];

    const player = {
      cards: playerStartingHand,
      count: this.getCount(playerStartingHand)
    };
    const dealer = {
      cards: dealerStartingHand,
      count: this.getCount(dealerStartingHand)
    };

    return {deckRemaining: draw.data.remaining, player, dealer };
  }

  startNewGame(type) {
    if (type === 'continue') {
      if (this.state.wallet > 0) {
        const deck = (this.state.deck.length < 10) ? this.generateDeck() : this.state.deck;
        const {remainder, player, dealer } = this.dealCards();

        this.setState({
          deckRemaining: remainder,
          dealer,
          player,
          currentBet: null,
          gameOver: false,
          message: null
        });
      } else {
        this.setState({ 
          message: 'Game over! You are broke!' ,
          gameOver: true
        });
      }
    } else {
      const deck = this.generateDeck();
      const {remainder, player, dealer } = this.dealCards();

      this.setState({
        deckRemaining: remainder,
        dealer,
        player,
        inputValue: '',
        currentBet: null,
        gameOver: false,
        message: null
      });
    }
  }

  /* getRandomCard(deck) {
    const updatedDeck = deck;
    const randomIndex = Math.floor(Math.random() * updatedDeck.length);
    const randomCard = updatedDeck[randomIndex];
    updatedDeck.splice(randomIndex, 1);
    return { randomCard, updatedDeck };
  } */

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
          this.startNewGame()
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
        const { randomCard } = newCard.data.cards[0];
        const player = this.state.player;
        player.cards.push(randomCard);
        player.count = this.getCount(player.cards);

        if (player.count === 21) {
          this.setState({ message: "Blackjack!" });
          this.stand();
        } else if (player.count > 21) {
          this.setState({ player, gameOver: true, message: 'BUST!' });
          axios({
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
          this.hit();
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


  async split() {
    if (!this.state.gameOver) {
      if (this.state.currentBet) {
        if (this.state.player.cards.length === 2) {
          if (this.state.player.cards[0].value === this.state.player.cards[1].value) {
            // split the hands
            let leftHand = {
              cards: [this.state.player.cards[0]],
              currentBet: this.state.currentBet
            };
            let rightHand = {
              cards: [this.state.player.cards[1]],
              currentBet: this.state.currentBet
            };
            // add a second equal bet to the second hand
            let result = await axios({
              method: 'put',
              url: `${this.state.serverURL}/users/${this.props.username}`,
              withCredentials: true,
              data: {
                'money': this.state.wallet - this.state.currentBet
              }
            });
            // pull a card for each hand
            const splitDraw = await axios({
              method: 'get',
              url: `https://deckofcardsapi.com/api/deck/${this.state.deck}/draw/?count=2`
            });
            let {leftCardPulled, rightCardPulled} = [...splitDraw.data.cards];
            leftHand.cards.push(leftCardPulled);
            rightHand.cards.push(rightCardPulled.randomCard);
            // update state
            this.setState({
              deckRemaining: splitDraw.data.remaining,
              player: {
                cards: leftHand.cards,
                count: this.getCount(leftHand.cards)
              },
              wallet: result.data.money,
              currentBet: this.state.currentBet * 2,
              splitHand: {
                cards: rightHand.cards,
                count: this.getCount(rightHand.cards),
                currentBet: this.state.currentBet / 2
              }
            });
            
          } else {
            this.setState({ message: "Your cards must have the same value to split." });
          }
        } else {
          this.setState({ message: "You cannot split now." });
        }
      } else {
        this.setState({ message: "Please place your bet." })
      }
    } else {
      this.setState({ message: "You are out of money." })
    }
  }

  dealerDraw(dealer) {
    const dealerDraw = await axios({
      method: 'get',
      url: `https://deckofcardsapi.com/api/deck/${this.state.deck}/draw/?count=1`
    });
    dealer.cards.push(dealerDraw.data.cards[0]);
    dealer.count = this.getCount(dealer.cards);
    return { dealer, remainder: dealerDraw.data.remaining };
  }

  getCount(cards) {
    const rearranged = [];
    cards.forEach(card => {
      if (card.code.split("")[0] === 'A') {
        rearranged.push(card);
      } else if (card.code.split("")[0]) {
        rearranged.unshift(card);
      }
      // (card.number === 'A') ? rearranged.push(card) : rearranged.unshift(card);
    });

    return rearranged.reduce((total, card) => {
      if (card.code.split("")[0] === 'J' || card.code.split("")[0] === 'Q' || card.code.split("")[0] === 'K') {
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
      // Show dealer's 2nd card
      const dealerCard = await axios({
        'method': 'get',
        'url': `https://deckofcardsapi.com/api/deck/${this.state.deck}/draw/?count=1`
      });
      const remainder = dealerCard.data.remaining;
      let dealer = this.state.dealer;
      dealer.cards.pop();
      dealer.cards.push(dealerCard.data.cards[0]);
      dealer.count = this.getCount(dealer.cards);

      // Keep drawing cards until count is 17 or more
      while (dealer.count < 17) {
        // setTimeout(() => {
          const draw = this.dealerDraw(dealer, deck);
          dealer = draw.dealer;
          deck = draw.updatedDeck;
        // }, 2000);
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
          gameOver: this.state.gameOver,
          message
        });

      }
      setTimeout(() => {
        this.startNewGame();
      }, 4000);

    } else {
      this.setState({ message: 'Game over! Please start a new game.' });
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
    let dealerCount;
    const card1 = this.state.dealer.cards[0].code.split("")[0];
    const card2 = this.state.dealer.cards[1].code.split("")[0];
    if (card2) {
      dealerCount = this.state.dealer.count;
    } else {
      if (card1 === 'J' || card1 === 'Q' || card1 === 'K') {
        dealerCount = 10;
      } else if (card1 === 'A') {
        dealerCount = 11;
      } else {
        dealerCount = card1;
      }
    }

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
                    <table className="cards">
                      {
                        this.state.currentBet ?
                        <tbody>
                        <tr>
                          {this.state.dealer.cards.map((card, i) => {
                            return <img src={card.image} alt={`${card.value} of ${card.suit}`}/>
                            //return <Card key={i} number={card.code.split("")[0]} suit={card.suit} />;
                          })}
                          <p>({this.state.dealer.count})</p>
                        </tr>
                      </tbody>
                      : null
                      }
                    </table>
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
                        !this.state.currentBet ?
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
                    </div>
                  </div>
              </div>
              <div className="card">
                  <div className="card-body">
                      <div className="card-text d-flex justify-content-around">
                          <button className="btn btn-lg btn-primary" onClick={this.hit.bind(this)}>Hit</button>
                          <button className="btn btn-lg btn-primary" onClick={this.stand.bind(this)}>Stand</button>
                          <button className="btn btn-lg btn-primary" onClick={this.split.bind(this)}>Split</button>
                          <button className="btn btn-lg btn-primary" onClick={this.doubleDown.bind(this)}>Double Down</button>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* <!-- Players Area --> */}
      <div className="row fixed-bottom p-2">
          <div className="col-lg-12 d-inline-flex justify-content-around players card-group">
                <table className="cards">
                  {
                    this.state.currentBet ? 
                    <tbody>
                    <tr>
                    {
                      this.state.splitHand ?
                      <p>({this.state.player.count})</p>
                      : null
                      }
                    {this.state.player.cards.map((card, i) => {
                      return <img src={card.image} alt={`${card.value} of ${card.suit}`}/>
                      //return <Card key={i} number={card.number} suit={card.suit} />
                      })}
                      {
                      !this.state.splitHand ?
                      <p>({this.state.player.count})</p>
                      : null
                      }
                    </tr>
                    </tbody>
                    : null
                  }
                </table>
              {/* <!-- sample player card --> */}
              <div className="card">
                  <div className="card-top text-center hand">Look <a
                          href="https://www.htmlsymbols.xyz/games-symbols/playing-cards">here</a> for a list
                      of all Unicode playing cards.</div>
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
              <p className="mt-6">{this.state.message}</p>


          </div>
      </div>
      {/* <!-- End Player Area --> */}
  </div>
    );

  }

};

const Card = ({ number, suit }) => {
  const combo = (number) ? `${number}${suit}` : null;
  const color = (suit === '♦' || suit === '♥') ? 'card-red' : 'card';

  return (
    <td>
      <div className={color}>
        {combo}
      </div>
    </td>
  );
};