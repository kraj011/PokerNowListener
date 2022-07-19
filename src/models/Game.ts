import Hand from "./Hand";
import Log from "./Log";
let crypto = require("crypto");
import Player from "./Player";
import Seat from "./Seat";
import { emojiFlip } from "../utils";
import EmojiCard from "./EmojiCard";
import Card from "./Card";


class Game {
    hands: Hand[] = [];
    currentHand: Hand = new Hand();
    
    dealerId: string = "";

    constructor(rows: Log[]) {
        rows.reverse().forEach((row) => {
            this.parseLine(row);
        })
        console.log(`SB: ${this.currentHand.smallBlind.name} and BB: ${this.currentHand.bigBlind[0].name}`)
    }


    
    parseLine({entry, at, order}: Log) {
        let date = Date.parse(at)/1000;


        if(entry.startsWith("-- starting hand")) {
            let startingHandComponents = entry.split(" (dealer: \"");
            let unparsedDealer = startingHandComponents[startingHandComponents.length - 1].replace("\") --", "");

            let dealerSeperator = " @ ";
            if(unparsedDealer.includes(" # ")) {
                dealerSeperator = " # ";
            }
    

            if(entry.includes("dead button")) {

                let hand = new Hand();
               
                let handIdIndex = crypto.createHash("md5").update(`deadbutton-${date ?? 0}`).digest("hex").substring(0, 15);
                let hexInt = parseInt(handIdIndex, 16);
                hand.id = hexInt;
                hand.date = date;
               
                this.currentHand = hand;
                this.hands.push(hand);

            } else {

                let dealerNameIdArray = unparsedDealer.split(dealerSeperator);;
                let hand = new Hand();
                this.dealerId = dealerNameIdArray[dealerNameIdArray.length - 1];
                let handIdIndex = crypto.createHash("md5").update(`${this.dealerId ?? "error"}-${date ?? 0}`).digest("hex").substring(0, 15);
                let hexInt = parseInt(handIdIndex, 16);
                hand.id = hexInt;
                hand.date = date;
               
                this.currentHand = hand;
                this.hands.push(hand);
            }

        } else if (entry.startsWith("Player stacks")) {

            let playersWithStacks = entry.replace("Player stacks: ", "").split(" | ");
            let players: Player[] = [];
            
            playersWithStacks.forEach((playerWithStack) => {

                let seatNumber = playerWithStack.split(" ")[0];
                let playerWithStackNoSeat = playerWithStack.replace(`${seatNumber ?? ""} `, "");
                let seatNumberInt = parseInt(seatNumber.replace("#", "") ?? "0");

                let nameIdArray = playerWithStackNoSeat.split("\" ")[0].replace("\"", "").split(" @ ");
                let stackSizeSplit = playerWithStack.split("\" (");
                let stackSize = stackSizeSplit[stackSizeSplit.length - 1].replace(")", "");

                let player = new Player();
                player.admin = false;
                player.id = nameIdArray[nameIdArray.length-1];
                player.stack = parseFloat(stackSize ?? "0");
                player.name = nameIdArray[0];
                
                players.push(player);

                let seat = new Seat();
                seat.player = player;
                seat.summary = `${player.name ?? "Unknown"} didn't show and lost`
                seat.preFlopBet = false;
                seat.number = seatNumberInt;

                this.currentHand.seats.push(seat);

            })

            this.currentHand.players = players;
            let dealersFiltered = players.filter((p) => p.id === this.dealerId);
            this.currentHand.dealer = dealersFiltered[0] ?? null;

        } else if (entry.startsWith("Your hand is ")) {
            // line 116
            this.currentHand.hole = entry.replace("Your hand is ", "").split(", ").map((val) => emojiFlip(val as EmojiCard ?? EmojiCard.error));

        } else if (entry.startsWith("Flop")) {
            let line = entry.slice(entry.indexOf("[")+1, entry.indexOf("]"));
            this.currentHand.flop = line.replace("Flop: ", "").split(", ").map((val) => emojiFlip(val as EmojiCard ?? EmojiCard.error));

        } else if (entry.startsWith("Turn")) {
            let line = entry.slice(entry.indexOf("[")+1, entry.indexOf("]"));
            this.currentHand.turn =  emojiFlip(line as EmojiCard ?? EmojiCard.error)

        } else if (entry.startsWith("River")) {
            let line = entry.slice(entry.indexOf("[")+1, entry.indexOf("]"));
            this.currentHand.river =  emojiFlip(line as EmojiCard ?? EmojiCard.error)

        } else {
            let nameIdArray = entry.split("\" ")[0].split(" @ ");
            let player = this.currentHand.players.filter((p) => p.id === nameIdArray[nameIdArray.length - 1])[0];
            if(entry.includes("big blind")) {
                let entrySplit = entry.split("big blind of ");
                let bigBlindSize = parseFloat(entrySplit[entrySplit.length - 1] ?? "0") ?? 0;
                this.currentHand.bigBlindSize = bigBlindSize;
                this.currentHand.bigBlind.push(player);

            }

            if(entry.includes("small blind")) {
                let entrySplit = entry.split("small blind of ");
                let smallBlindSize = parseFloat(entrySplit[entrySplit.length - 1] ?? "0") ?? 0;
                this.currentHand.smallBlindSize = smallBlindSize;
                
                if(entry.includes("missing")) {
                    this.currentHand.missingSmallBlinds.push(player)
                } else {
                    this.currentHand.smallBlind = player;
                }

            }



        }
     
        this.currentHand.lines.push(entry ?? "unknown line");
        
    }


}

export default Game;