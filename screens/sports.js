import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  Flatlist,
  ActivityIndicator
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
        this.state = {
            searchTerm: "",
            awaitingText: false,
            selectedDate: {
                year: today.getFullYear(),
                month: today.getMonth() + 1,
                day: today.getDate()
            }
        };
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
              this.state.setState({
                  selectedDate: {
                    year: year,
                    month: month,
                    day: day}}, function() {
                        console.log("Set date to :", this.state.selectedDate);
                    });
            }
          } catch ({code, message}) {
            console.warn('Cannot open date picker', message);
          }
    }

    // send a text
    async sendText(message) {
        const validSports = "bfhmBFHM";

        // check if the entered sport is valid. if the index of the entered
        // sport is -1, it is invalid
        if (validSports.indexOf(message[0]) != -1) {
            const dateString = "" + this.state.selectedDate.year +
                this.state.selectedDate.month + this.state.selectedDate.day;
            const messageToSend = "s" + message[0] + dateString;
            console.log(messageToSend);
            // show the loading spinner while waiting for response
            this.props.setAwaitingText(true);
            sendSms(messageToSend);
        } else {
            console.log("Not valid sport, msg:", message);
        }
    }


    render() {
        let gameList = [];
        let messages = this.props.messages;
        // look through the messages received to see if any are of wikipedia type
        for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex--) {
            let message = messages[messageIndex];
            if (message.api === "sports") {
                // if it is wikipedia type, show it as the info
                const games = parseSports(message.data);
                gameList = gameList.concat(games);

            }
        }

        // add keys so react-native shuts up
        for (i in gameList) {
            gameList[i].key = i;
        }

        return (
            <View style={styles.container}>
                <TextInput
                    style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(searchTerm) => this.setState({searchTerm})}
                    value={this.state.searchTerm}
                />
                <Button
                    onPress={() => this.sendText(this.state.searchTerm)}
                    title="Check Games"
                    color="#841584"
                />
                <Button
                    onPress={() => this.setDate()}
                    title="Set Date"
                    color="#841584"
                />
                <Text>
                    {"Send 'b' for NBA scores, 'f' for NFL scores, 'h' for NHL scores, or 'm' for MLB scores followed by your chosen day, e.g. 20180115 for the 15th of January"}
                </Text>
                {this.props.awaitingText ?
                    // show loading spinner if we're waiting on a text
                    <ActivityIndicator size="large" color="#0000ff" />
                :
                    // if not waiting on a text, don't show anything here
                    null
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
});

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}

function mapStateToProps(state) {
    return {
        messages: state.messages,
        awaitingText: state.awaitingText
    }
}

// parseSports returns a list of the games received
export const parseSports = (data) => {
    let games = [];
    if (data == "") {
        return games;
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
