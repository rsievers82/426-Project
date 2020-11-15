export default class BlackjackModel {
    constructor() {
        this.deck = [];
        for (let i = 1; i <= 13; i++) {
            this.deck.push(new Card(i, "hearts"));
            this.deck.push(new Card(i, "diamonds"));
            this.deck.push(new Card(i, "clubs"));
            this.deck.push(new Card(i, "spades"));
        }
        this.shuffleDeck();
        
    }

    shuffleDeck() {
        let temp = [];
        for (let i = 0; i < 52; i++) {
            temp.push(this.deck.splice(Math.floor(Math.random() * this.deck.length), 1)[0]);
        }
        this.deck = temp;
    }
}

export class Card {
    constructor(denomination, suit) {
        this.denomination = denomination;
        this.suit = suit;
    }


}
