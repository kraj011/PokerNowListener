# PokerNowListener

## Description

The goal of this tool is to be able to connect to your pokernow.club games in real time and convert it's logs to the PokerStars format to allow you to import them into your favorite hand tracking software (like PokerTracker).

The idea for this is heavily based off of [PokerNowGrabber](https://github.com/pj4533/PokerNowGrabber), which unfortunately does not seem to work anymore and lacked some pretty basic features, such as cross platform and multi-game support.

Most of the logic is stripped from [PokerNowKit](https://github.com/pj4533/PokerNowKit), with translation to typescript and some modifications for newer updates to PokerNow.

## Contributions

Feel free to submit an issue ticket if there is a particular feature you want added as well as a PR if you feel like implementing that feature :D.

## Future Work

There are several modifications I hope to make for the future of this app. Primarily, I want to look into parsing logic straight from the websocket messages we get, instead of using the websockets to simply figure out when a hand has ended. The websocket data seems to be encoded in a weird way which is why I chose to start with PokerNowKit's log parsing code instead.

## Feature Tracking

-   [x] Cross platform
-   [ ] Multi table support
-   [ ] Parse websockets instead of using game logs
-   [ ] Cleaner UI
-   [ ] PokerTracker HUD support
