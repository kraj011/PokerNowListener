import Player from "./Player";

class Seat {
    player: Player;
    summary: string = "";
    preFlopBet: boolean = false;
    showedHand: string;
    stack: number;
    number: number;

}
export default Seat;