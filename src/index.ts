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
        // reconnectionDelayMax: 10000,
        query: {
            "gameID": gameId
        },
        extraHeaders: {
            "Cookie": `npt=${cookie};`
        },
        // cookieField: "",
        transports: ['websocket'],
        // jsonp: false,
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

// getLog("pglFMfeB4v6HT4bvxB5-1OPY2", "kK50iJDcE-CdM-UhEYuQH6y-M3Q6BHJXBJUYDAtEMf3NMmJ6OG", "165820973581100", "165820977548400").then((rows) => {
//     let game = new Game(rows);
//     console.log(game.hands[0])
    
// }).catch((err) => {
//     console.log(err)
// })

// getLog()
export {};