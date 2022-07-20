const { menubar } = require('menubar');
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const io = require("socket.io-client");
const { getLog } = require('./utils');
import Game from "./models/Game"

declare global {
    interface Window {
        electronAPI: any;
    }
}


const mb = menubar({
    browserWindow: {
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
          }
    }
});

ipcMain.on("connect", (e, gameLink, cookie, name) => {
    let gameId = gameLink.replace("https://www.pokernow.club/games/", "");
    console.log('Trying to connect to ', gameLink)
    // wss://www.pokernow.club/socket.io/?gameID=pglcjUbhEU6OO_5yaju3sZrEk&firstConnection=true&layout=d&EIO=3&transport=websocket
    const socket = io("wss://www.pokernow.club", {
        query: {
            "gameID": gameId
        },
        extraHeaders: {
            "Cookie": `npt=${cookie};`
        },
        transports: ['websocket'],
    });
    

    socket.on("connect", () => {
        console.log("connected to socket")
    })

    socket.on("disconnect", () => {
        console.log("disconnected from socket")
    })

    socket.on("error", (e) => {
        console.log(e)
    })

    socket.on("rup", () => {
        console.log("Connected - Loaded RUP")
    })

    socket.on("gC", (stateArray, ack) => {
        console.log(stateArray)
    })

    socket.on("registered", (data) => {
        console.log("registered", data)
    })

})

mb.on('ready', () => {
  console.log('app is ready');
  // your app code here

});

mb.on("after-create-window", () => {
    mb.window.openDevTools()
})

// getLog("pgl0ijxmlFn5xgBZGdJtGE4Es", "kK50iJDcE-CdM-UhEYuQH6y-M3Q6BHJXBJUYDAtEMf3NMmJ6OG", "165835805857000", "165835811407200").then((rows) => {
//     console.log(rows)
//     let game = new Game(rows);
//     console.log("Writing table hand id")
//     let pokerStarsLines = game.hands[0].pokerStarsDescription("David", 1.0, "pgl0ijxmlFn5xgBZGdJtGE4Es");
//     let output = pokerStarsLines.join("\n");
//     console.log(output)
    
// }).catch((err) => {
//     console.log(err)
// })

// getLog()
export {};