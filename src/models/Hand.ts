import { emojiFlip, getCardKeyFromValue } from "../utils";
import Card from "./Card";
import EmojiCard from "./EmojiCard";
import Player from "./Player";
import Seat from "./Seat";
const moment = require("moment")

class Hand {
    date: number; // date in unix time (ms)
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

    hasAnte: boolean = false;
    anteSize: number = 0.0;

    printedShowdown: boolean = false;

    pokerStarsDescription = (heroName: string, multiplier: number, tableName: string) => {
        let lines : string[] = [];
        
        let dateString = moment(this.date).format("yyyy/MM/DD HH:mm:ss");

        let previousAction = {};
        this.players.forEach((player) => {
            previousAction[player.id ?? "error"] = 0;
        })

        previousAction[this.smallBlind.id ?? "error"] = this.smallBlindSize * multiplier;
        
        this.bigBlind.forEach((player) => {
            previousAction[player.id ?? "error"] = this.bigBlindSize * multiplier;
        })

        let foundHoleCards = false;
        let isFirstAction = false 
        let currentBet = this.bigBlindSize * multiplier;
        let totalPotSize = 0.0;
        let streetDescription = "before Flop";

        //first detect if game is anted
        this.lines.forEach((line) => {
            if(line.includes("posts an ante")) {
                this.hasAnte = true;
                let size = parseFloat(line.split(" ").at(-1)) ?? 0.0;
                this.anteSize = size;
            }
        })

        this.lines.forEach((line) => {
            if(line.includes("starting hand")) {
                this.uncalledBet = 0;
                lines.push(`PokerStars Hand #${this.id}: Hold'em No Limit (${(this.smallBlindSize*multiplier).toFixed(2)}/${(this.bigBlindSize*multiplier).toFixed(2)} USD) - ${dateString} ET`)
                let smallBlindSeat = 0;
                this.seats.forEach((seat) => {
                    if(this.smallBlind.id === seat.player.id) {
                        smallBlindSeat = seat.number;
                    }
                })

                let dealerSeat = (smallBlindSeat - 1) > 0 ? (smallBlindSeat - 1) : 10;
                this.seats.forEach((seat) => {
                    if(this.dealer.id === seat.player.id) {
                        dealerSeat = seat.number;
                    }
                })

                lines.push(`Table '${tableName}' 10-max Seat #${dealerSeat} is the button`);

            }

            if(line.includes("Player stacks:")) {
                let playersWithStacks = line.replace("Player stacks: ", "").split(" | ");
                playersWithStacks.forEach((playerWithStack) => {
                    let seatNumber = playerWithStack.split(" ")[0];
                    let playerWithStackNoSeat = playerWithStack.replace(`${seatNumber} `, "");
                    seatNumber = seatNumber.replace("#", "");
                    let seatNumberInt = parseInt(seatNumber) ?? 0;

                    let nameIdArray = playerWithStackNoSeat.split("\" ")[0].replace("\"", "").split(" @ ");
                    let playerWithStackSplit = playerWithStack.split("\" (");
                    let stackSize = playerWithStackSplit[playerWithStackSplit.length-1].replace(")", "");
                    let stackSizeFormatted = (parseFloat(stackSize)*multiplier).toFixed(2);

                    lines.push(`Seat ${seatNumberInt}: ${nameIdArray[0] ?? "error"} (${stackSizeFormatted} in chips)`);

                })

                if(this.hasAnte) {
                    playersWithStacks.forEach((playerWithStack) => {
                        let seatNumber = playerWithStack.split(" ")[0];
                        let playerWithStackNoSeat = playerWithStack.replace(`${seatNumber} `, "");
                        let nameIdArray = playerWithStackNoSeat.split("\" ")[0].replace("\"", "").split(" @ ");    
                        lines.push(`${nameIdArray[0] ?? "error"}: posts the ante ${this.anteSize}`);
                    })
                }



                lines.push(`${this.smallBlind.name ?? "Unknown"}: posts small blind ${(this.smallBlindSize*multiplier).toFixed(2)}`);

                this.bigBlind.forEach((bb) => {
                    lines.push(`${bb.name ?? "Unknown"}: posts big blind ${(this.bigBlindSize*multiplier).toFixed(2)}`);
                })
            }

            if(line.includes("Your hand")) {
                lines.push("*** HOLE CARDS ***")
                lines.push(`Dealt to ${heroName} [${this.hole.map((hole) => getCardKeyFromValue(hole)).join(" ") ?? "error"}]`)
                foundHoleCards = true;
            }

            if(line.startsWith("\"")) {
                if(line.includes("bets") || line.includes("shows") || line.includes("calls") || line.includes("raises") || line.includes("checks") || line.includes("folds") || line.includes("wins") || line.includes("gained") || line.includes("collected") || line.includes("posts a straddle")) {
                    if(!foundHoleCards) {
                        lines.push("*** HOLE CARDS ***");
                        foundHoleCards = true;
                    }

                    let nameIdArray = line.split("\" ")[0].split(" @ ");
                    let player = this.players.filter((p) => p.id === nameIdArray[nameIdArray.length - 1])[0];
                    if(line.includes("bets")) {
                        let index = this.seats.findIndex((p) => p.player.id === player.id);
                        if(index !== -1) {
                            this.seats[index].preFlopBet = true;
                        }

                        let betSize = (parseFloat(line.replace(" and go all in", "").split(" ").at(-1) ?? "0") ?? 0) * multiplier;
                        lines.push(`${player.name ?? "unknown"}: bets ${betSize.toFixed(2)}`);
                        currentBet = betSize;
                        isFirstAction = false;

                        previousAction[player.id ?? "error"] = betSize;

                    }

                    if(line.includes("posts a straddle")) {
                        let index = this.seats.findIndex((p) => p.player.id === player.id);
                        if(index !== -1) {
                            this.seats[index].preFlopBet = true;
                        }

                        let straddleSize = (parseFloat(line.split("of ").at(-1) ?? "0") ?? 0) * multiplier;
                        lines.push(`${player.name ?? "unknown"}: raises ${(straddleSize - currentBet).toFixed(2)} to ${straddleSize.toFixed(2)}`);
                        currentBet = straddleSize;
                        previousAction[player.id ?? "error"] = straddleSize;

                    }

                    if(line.includes("raises")) {
                        let index = this.seats.findIndex((p) => p.player.id === player.id);
                        if(index !== -1) {
                            this.seats[index].preFlopBet = true;
                        }

                        let raiseSize = (parseFloat(line.replace(" and go all in", "").split("to ").at(-1) ?? "0") ?? 0) * multiplier;
                        if(isFirstAction) {
                            lines.push(`${player.name ?? "unknown"}: bets ${raiseSize.toFixed(2)}`);
                            currentBet = raiseSize;
                            isFirstAction = false;
                        } else {
                            lines.push(`${player.name ?? "unknown"}: raises ${(raiseSize-currentBet).toFixed(2)} to ${raiseSize.toFixed(2)}`);
                            currentBet = raiseSize;
                        }

                        previousAction[player.id ?? "error"] = raiseSize;


                    }

                    if(line.includes("calls")) {
                        let index = this.seats.findIndex((p) => p.player.id === player.id);
                        if(index !== -1) {
                            this.seats[index].preFlopBet = true;
                        }
                        let callSize = (parseFloat(line.replace(" and go all in", "").split("calls ").at(-1) ?? "0") ?? 0) * multiplier;
                        if(isFirstAction) {
                            lines.push(`${player.name ?? "unknown"}: bets ${callSize.toFixed(2)}`);
                            currentBet = callSize;
                            isFirstAction = false;
                        } else {
                            let uncalledPortionOfBet = callSize - (previousAction[player.id ?? "error"] ?? 0.0);
                            lines.push(`${player.name ?? "unknown"}: calls ${uncalledPortionOfBet.toFixed(2)}`);
                        }
                        
                        previousAction[player.id ?? "error"] = callSize;
                    }

                    if(line.includes("checks")) {
                        lines.push(`${player.name ?? "unknown"}: checks`);
                    }

                    if(line.includes("folds")) {
                        lines.push(`${player.name ?? "unknown"}: folds`);
                        let index = this.seats.findIndex((p) => p.player.id === player.id);
                        if(index !== -1) {
                            if(streetDescription == "before Flop" && !this.seats[index].preFlopBet) {
                                this.seats[index].summary = `${player.name ?? "Unknown"} folded ${streetDescription} (didn't bet)`
                            } else {
                                this.seats[index].summary = `${player.name ?? "Unknown"} folded ${streetDescription}`
                            }
                        }
                    }

                    if(line.includes("shows")) {
                        let handComponents = line.split("shows a ").at(-1).replace(".", "").split(", ");
                        let index = this.seats.findIndex((p) => p.player.id === player.id);
                        if(index !== -1) {
                            this.seats[index].showedHand = handComponents.map((val) => emojiFlip(val as EmojiCard ?? EmojiCard.error)).join(" ") ?? "error";
                            lines.push(`${player.name ?? "Unknown"}: shows [${this.seats[index].showedHand}]`)
                        }
                    }

                    if(line.includes("collected ")) {

                        // if we made it to showdown
                        if(line.includes(" from pot with ")) {
                            let winPotSize = parseFloat(line.split(" collected ").at(-1).split(" from pot with ")[0] ?? "0")*multiplier;
                            
                            // From PokerNowKit: remove missing smalls -- poker stars doesnt do this?
                            winPotSize = winPotSize - ((this.smallBlindSize * this.missingSmallBlinds.length)*multiplier);

                            let winDescription = line.split(" from pot with ").at(-1).split(" (")[0] ?? "error";
                            totalPotSize = winPotSize;
                            if(!this.printedShowdown) {
                                lines.push("*** SHOW DOWN ***");
                                this.printedShowdown = true;
                            }
                            lines.push(`${player.name ?? "Unknown"} collected ${winPotSize.toFixed(2)} from pot`);

                            let index = this.seats.findIndex((p) => p.player.id === player.id);
                            if(index !== -1) {
                                this.seats[index].summary = `${player.name ?? "Unknown"} showed [] and won ${winPotSize.toFixed(2)} with ${winDescription}`;
                            }

                        } else {
                            // did not make it to showdown
                            let gainedPotSize = (parseFloat(line.split(" collected ").at(-1).split(" from pot")[0] ?? "0") ?? 0.0)*multiplier;
                            
                            gainedPotSize = gainedPotSize - ((this.smallBlindSize * this.missingSmallBlinds.length)*multiplier);

                            if(this.flop.length === 0) {
                                let preFlopAction = 0.0;

                                this.players.forEach((player) => {
                                    preFlopAction += previousAction[player.id ?? "error"] ?? 0.0;
                                });

                                //if fold around preflop
                                if(preFlopAction === (this.bigBlindSize + this.smallBlindSize)*multiplier) {
                                    gainedPotSize = this.smallBlindSize*multiplier;
                                    lines.push(`Uncalled bet (${(this.bigBlindSize*multiplier).toFixed(2)}) returned to ${player.name ?? "Unknown"}`);
                                } else {
                                    if(this.uncalledBet > 0) {
                                        lines.push(`Uncalled bet (${(this.uncalledBet*multiplier).toFixed(2)}) returned to ${player.name ?? "Unknown"}`);
                                    }
                                }
                            
                            } else {
                                if(this.uncalledBet > 0) {
                                    lines.push(`Uncalled bet (${(this.uncalledBet*multiplier).toFixed(2)}) returned to ${player.name ?? "Unknown"}`);
                                }
                            }

                            totalPotSize = gainedPotSize;
                            lines.push(`${player.name ?? "Unknown"} collected ${gainedPotSize.toFixed(2)} from pot`)
                            let index = this.seats.findIndex((p) => p.player.id === player.id);
                            if(index !== -1) {
                                this.seats[index].summary = `${player.name ?? "Unknown"} collected ${gainedPotSize.toFixed()}`
                            }


                        }



                    }

                    






                }
                




            }

            if(line.startsWith("Uncalled bet")) {
                let uncalledString = line.split(" returned to")[0].replace("Uncalled bet of ", "");
                this.uncalledBet = parseFloat(uncalledString ?? "0") ?? 0;
            }

            if(line.startsWith("Flop: ")) {
                lines.push(`*** FLOP *** [${this.flop.map((val) => getCardKeyFromValue(val)).join(" ") ?? "error"}]`)
                isFirstAction = true;
                currentBet = 0;
                this.players.forEach((p) => {
                    previousAction[p.id ?? "error"] = 0;
                })
                streetDescription = "on the Flop";
            }

            if(line.startsWith("Turn: ")) {
                lines.push(`*** TURN *** [${this.flop.map((val) => getCardKeyFromValue(val)).join(" ") ?? "error"}] [${getCardKeyFromValue(this.turn) ?? "error"}]`)
                isFirstAction = true;
                currentBet = 0;
                this.players.forEach((p) => {
                    previousAction[p.id ?? "error"] = 0;
                })
                streetDescription = "on the Turn";
            }

            if(line.startsWith("River: ")) {
                lines.push(`*** RIVER *** [${this.flop.map((val) => getCardKeyFromValue(val)).join(" ") ?? "error"} ${getCardKeyFromValue(this.turn) ?? "error"}] [${getCardKeyFromValue(this.river) ?? "error"}]`)
                isFirstAction = true;
                currentBet = 0;
                this.players.forEach((p) => {
                    previousAction[p.id ?? "error"] = 0;
                })
                streetDescription = "on the River";
            }

            if(line === this.lines.at(-1)) {
                lines.push("*** SUMMARY ***");
                lines.push(`Total pot: ${totalPotSize.toFixed(2)} | Rake 0`);
                let board: Card[] = [];
                board = board.concat(this.flop);
                if(this.turn) {
                    board.push(this.turn);
                }
                if(this.river) {
                    board.push(this.river);
                }

                if(board.length > 0) {
                    lines.push(`Board: [${board.map((val) => getCardKeyFromValue(val)).join(" ")}]`)
                }

                this.seats.forEach((seat) => {
                    let summary = seat.summary;
                    if(this.dealer.id === seat.player.id) {
                        summary = summary.replace(seat.player.name ?? "Unknown", `${seat.player.name ?? "Unknown"} (button)`)
                    }

                    if(this.smallBlind.id === seat.player.id) {
                        summary = summary.replace(seat.player.name ?? "Unknown", `${seat.player.name ?? "Unknown"} (small blind)`)
                    }

                    this.bigBlind.forEach((bb) => {
                        if(bb.id === seat.player.id) {
                            summary = summary.replace(seat.player.name ?? "Unknown", `${seat.player.name ?? "Unknown"} (big blind)`)
                        }
                    })

                    if(seat.showedHand && seat.showedHand !== "" && !summary.includes("[]")) {
                        lines.push(`Seat ${seat.number}: ${summary} [${seat.showedHand ?? "error"}]`)
                    } else {
                        summary = summary.replace("[]", `[${seat.showedHand ?? "error"}]`);
                        lines.push(`Seat ${seat.number}: ${summary}`)
                    }

                })
                lines.push("");


            }







        })

        
        return lines;


    }




}

export default Hand;