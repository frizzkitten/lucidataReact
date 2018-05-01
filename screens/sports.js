import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  FlatList,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import { connect } from 'react-redux';
import { ActionCreators } from '../app/actions';
import { bindActionCreators } from 'redux';

import parseSms from "../app/lib/parseSms";
import readTexts from "../app/lib/readTexts";
import sendSms from "../app/lib/sendSms";


import {DatePickerAndroid } from 'react-native';
import { PermissionsAndroid } from 'react-native';
import SmsAndroid from 'react-native-sms-android';
import SmsListener from 'react-native-android-sms-listener';

/*
Kyle's description of the interface.
Sports:
 -start with 's' to indicate call to sports handler
 -followed by 'b' for NBA scores, 'f' for NFL scores, 'h' for
   NHL scores, or 'm' for MLB scores
 -followed by date for which to remove scores (formatted
   as yyyymmdd)
Sports return message format:
 -each game separated by '/'
 -each piece of info in a game separated by ';'
 -first two elements of each game are the abbreviation
   of the away team followed by the abbreviation of the
   home team
 -the third element is the status of the game (a time if the
   game has not started yet, 'p' if the game is in progress,
   or 'f' if the game is finished
 -if the game is finished there will be 2 additional
   elements: the away team's score followed by the home
   team's score
*/
class Sports extends Component {
    constructor(props) {
        super(props);

        readTexts()
        .then(msgs => {
            this.props.setMessages(msgs);
        })
        .catch(err => {
            console.log("Error getting messages");
        });

        // Initialize to current day to not run into weird errors
        today = new Date()
        extendedMonth = (today.getMonth() < 10)? "0" + today.getMonth():today.getMonth();
        this.state = {
            searchTerm: "",
            awaitingText: false,
            selectedDate: {
                year: today.getFullYear(),
                month: today.getMonth() + 1,
                day: today.getDate()
            }
        };
        console.log("State: ", this.state);
    }

    // Allow user to adjust the date they want to see games from using the Android Date menu
    async setDate() {
        try {
            const {action, year, month, day} = await DatePickerAndroid.open({
              // Use `new Date()` for current date.
              // May 25 2020. Month 0 is January.
              date: new Date()
            });
            if (action !== DatePickerAndroid.dismissedAction) {
              // Selected year, month (0-11) (but need 1-12 for server), day
              month = month + 1;
              this.state.selectedDate.year = year;
              this.state.selectedDate.month = (month < 10)? "0" + month: month;
              this.state.selectedDate.day = day;
              console.log("Set date to ", this.state.selectedDate)
            //   this.state.setState({
            //       selectedDate: {
            //         year: year,
            //         month: month,
            //         day: day}}, function() {
            //             console.log("Set date to :", this.state.selectedDate);
            //         });
            }
          } catch ({code, message}) {
            console.warn('Cannot open date picker', message);
          }
    }

    // send a text
    async sendText(message) {
        // hide the keyboard
        Keyboard.dismiss();

        sportKey = message[0];
        switch(sportKey) {
            case "B":
            case "b": sportKey = "b";
                break;
            case "F":
            case "f": sportKey = "f";
                break;
            case "H":
            case "h": sportKey = "h";
                break;
            case "M":
            case "m": sportKey = "m";
                break;
            default:
                sportKey = "W";
        }

        if (sportKey != "W") { 
            const dateString = "" + this.state.selectedDate.year +
                this.state.selectedDate.month + this.state.selectedDate.day;
            const messageToSend = "s" + sportKey + dateString;
            console.log(messageToSend);
            // show the loading spinner while waiting for response
            this.props.setAwaitingText(true);
            sendSms(messageToSend);
        } else {
            console.log("Not valid sport, msg:", message);
        }

    }

    FlatListItemSeparator = () => {
        return (
          <View
            style={{
              height: 1,
              width: "100%",
              backgroundColor: "#607D8B",
            }}
          />
        );
    }

    formatGame(game) {
        // don't do any formatting if no games found
        if (game === "No games found.") {
            return game;
        }

        let msg = game.home + " VS " + game.away;
        if (game.status == "p") {
            msg += ": In Progress";
        } else if (game.status == "f") {
            msg += ": Final Score " + game.homeScore + "-" + game.awayScore;
        } else {
            msg += ": Starts at " + game.status;
        }

        return msg;
    }

    render() {
        let gameList = [];
        let messages = this.props.messages;
        // if a text exists that says no games were found
        let gamelessTextFound = false;
        // look through the messages received to see if any are of sports type
        for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex--) {
            let message = messages[messageIndex];
            if (message.api === "sports") {
                // if it is sports type, show it as the info
                const games = parseSports(message.data);
                // don't add the game if message says no games found
                if (games.length > 0 && games[0] === "No games found.") {
                    gamelessTextFound = true;
                }
                // add the game to the list of games to display as long as it
                // is an actual game
                else {
                    gameList = gameList.concat(games);
                }
            }
        }

        // if no games found and we have a text saying no games were found,
        // add a message saying no games were found
        if (gameList.length === 0 && gamelessTextFound) {
            gameList.push("No games found.");
        }

        // add keys so react-native shuts up
        for (i in gameList) {
            gameList[i].key = i;
        }

        return (
            <View style={{flex: 1}}>
                {this.props.keyboardShowing ?
                    null :
                    <View style={styles.flatlist}>
                        <FlatList
                        data={gameList}
                        ItemSeparatorComponent = {this.FlatListItemSeparator}
                        renderItem={({item}) => <Text style={styles.item}>{this.formatGame(item)}</Text>}
                        />
                    </View>
                }
                <View style={styles.container}>
                    <View style={styles.spacedView}>
                        <TextInput
                            style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                            onChangeText={(searchTerm) => this.setState({searchTerm})}
                            value={this.state.searchTerm}
                        />
                    </View>
                    <View style={styles.spacedView}>
                        <Button
                            onPress={() => this.sendText(this.state.searchTerm)}
                            title="Check Games"
                            color="#841584"
                        />
                    </View>
                    <View style={styles.spacedView}>
                        <Button
                            onPress={() => this.setDate()}
                            title="Set Date"
                            color="#841584"
                        />
                    </View>
                    <Text style={{textAlign: 'center'}}>
                        {"Send 'b' for NBA scores, 'f' for NFL scores, 'h' for NHL scores, or 'm' for MLB scores."}
                    </Text>
                    {this.props.awaitingText ?
                        // show loading spinner if we're waiting on a text
                        <ActivityIndicator size="large" color="#0000ff" />
                    :
                        // if not waiting on a text, don't show anything here
                        null
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  flatlist: {
      flex: 2,
      height:"50%",
      zIndex: 0
  },
  item: {
      padding: 12,
      fontSize: 14,
      height: 60
  },
  spacedView: {
      margin: 5
  }
});

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}

function mapStateToProps(state) {
    return {
        messages: state.messages,
        awaitingText: state.awaitingText,
        keyboardShowing: state.keyboardShowing
    }
}

// parseSports returns a list of the games received
export const parseSports = (data) => {
    let games = [];
    if (data == "") {
        return games;
    }
    // if no games were found, just return array with "no games found"
    if (data.includes("games found")) {
        return ["No games found."];
    }
    // remove api key
    data = data.substring(1, data.length);
    // split by games
    let split = data.split("/")

    for (i in split) {
        if (split[i] != "") {
            games.push(parseGame(split[i]));
        }
    }
    return games;
};

// parseGame returns a json object of the received game data
export const parseGame = (data) => {
    let jsonGame = {};

    let split = data.split(";");
    if (split.length < 3) {
        return jsonGame;
    }
    jsonGame.away = split[0];
    jsonGame.home = split[1];
    jsonGame.status = split[2];
    // Game is finished, will have scores, too
    if (jsonGame.status == "f") {
        jsonGame.awayScore = split[3];
        jsonGame.homeScore = split[4];
    }
    return jsonGame;
};

export default connect(mapStateToProps, mapDispatchToProps)(Sports);
