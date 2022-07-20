import Card from "./models/Card";
import EmojiCard from "./models/EmojiCard";
import Log from "./models/Log";

const axios = require('axios');

export const getLog = (gameId: string, cookie: string, startTime: string, endTime: string) => {
    console.log("starting get log")
    return new Promise(async (resolve, reject) => {
        let url = `https://www.pokernow.club/games/${gameId}/log?after_at=${startTime}&before_at=${endTime}`
        let logsResponse = await axios.get(url, {
            headers: {
                "Cookie": `npt=${cookie};apt=or2sk6taxkcb6yojk45um16ck6g2bblukk2tjboi0jstv;`
            }
        }).catch((err) => {
            // alert it here!
            reject(err);
        });

        let logs = logsResponse.data.logs;
        if(!logs) {
            // something went wrong
            console.log("err", logsResponse)
            reject("No logs found!");
            return
        }

        let foundEnding = false, foundStarting = false;
        let rows: Log[] = [];
        let tableHandId = "???";

        logs.forEach((log) => {
            let msg: string = log.msg;
            let at: string = log.at;
            let order: string = log.created_at;
            if(msg.includes("-- ending hand")) {
                foundEnding = true;
            }

            if(foundEnding && !foundStarting) {
                rows.push({
                    "entry": msg,
                    "at": at,
                    "order": order
                })
            }

            if(msg.includes("--starting hand")) {
                tableHandId = msg.replace("-- starting hand #", "").split(" ")[0];
                foundStarting = true;
            }

        })

        resolve(rows);

    })
}

export const emojiFlip = (card: EmojiCard) => {
    switch (card) {
        case EmojiCard.c2: return Card.c2
        case EmojiCard.c3: return Card.c3
        case EmojiCard.c4: return Card.c4
        case EmojiCard.c5: return Card.c5
        case EmojiCard.c6: return Card.c6
        case EmojiCard.c7: return Card.c7
        case EmojiCard.c8: return Card.c8
        case EmojiCard.c9: return Card.c9
        case EmojiCard.cT: return Card.cT
        case EmojiCard.cJ: return Card.cJ
        case EmojiCard.cQ: return Card.cQ
        case EmojiCard.cK: return Card.cK
        case EmojiCard.cA: return Card.cA

        case EmojiCard.d2: return Card.d2
        case EmojiCard.d3: return Card.d3
        case EmojiCard.d4: return Card.d4
        case EmojiCard.d5: return Card.d5
        case EmojiCard.d6: return Card.d6
        case EmojiCard.d7: return Card.d7
        case EmojiCard.d8: return Card.d8
        case EmojiCard.d9: return Card.d9
        case EmojiCard.dT: return Card.dT
        case EmojiCard.dJ: return Card.dJ
        case EmojiCard.dQ: return Card.dQ
        case EmojiCard.dK: return Card.dK
        case EmojiCard.dA: return Card.dA

        case EmojiCard.h2: return Card.h2
        case EmojiCard.h3: return Card.h3
        case EmojiCard.h4: return Card.h4
        case EmojiCard.h5: return Card.h5
        case EmojiCard.h6: return Card.h6
        case EmojiCard.h7: return Card.h7
        case EmojiCard.h8: return Card.h8
        case EmojiCard.h9: return Card.h9
        case EmojiCard.hT: return Card.hT
        case EmojiCard.hJ: return Card.hJ
        case EmojiCard.hQ: return Card.hQ
        case EmojiCard.hK: return Card.hK
        case EmojiCard.hA: return Card.hA
        
        case EmojiCard.s2: return Card.s2
        case EmojiCard.s3: return Card.s3
        case EmojiCard.s4: return Card.s4
        case EmojiCard.s5: return Card.s5
        case EmojiCard.s6: return Card.s6
        case EmojiCard.s7: return Card.s7
        case EmojiCard.s8: return Card.s8
        case EmojiCard.s9: return Card.s9
        case EmojiCard.sT: return Card.sT
        case EmojiCard.sJ: return Card.sJ
        case EmojiCard.sQ: return Card.sQ
        case EmojiCard.sK: return Card.sK
        case EmojiCard.sA: return Card.sA
        case EmojiCard.error: return Card.error
    }
}

export const getCardKeyFromValue = (card) => {
    if(!card) {
        return "error";
    }
    return card.toString();
    // let indexOfCard = Object.values(Card).indexOf(card);
    // return Object.keys(Card)[indexOfCard === -1 ? 0 : indexOfCard];
}