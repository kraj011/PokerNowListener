import Card from "./Card";
import Player from "./Player";
import Seat from "./Seat";

class Hand {
    date: number; 
    hole: Card[] = [];
    river: Card;
    turn: Card;
    flop: Card[] = []; 
    pot: number = 0.0;
    uncalledBet: number = 0.0;
    id: number = 0;
    dealer: Player;
    missingSmallBlinds: Player[] = [];
    smallBlind: Player;
    bigBlind: Player[] = [];
    players: Player[] = [];
    seats: Seat[] = [];
    lines: string[] = [];
    smallBlindSize: number = 0;
    bigBlindSize: number = 0;

    printedShowdown: boolean = false;

    pokerStarsDescription = (heroName: string, multiplier: number, tableName: string) => {
        
    }




}

export default Hand;