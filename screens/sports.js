import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  ActivityIndicator
} from 'react-native';
import { StackNavigator } from 'react-navigation';

import { connect } from 'react-redux';
import { ActionCreators } from '../app/actions';
import { bindActionCreators } from 'redux';

import parseSms from "../app/lib/parseSms";
import readTexts from "../app/lib/readTexts";

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
              this.state.selectedDate = {
                  year: year,
                  month: month,
                  day: day
              }
              console.log("Set date to :", this.state.selectedDate);

            }
          } catch ({code, message}) {
            console.warn('Cannot open date picker', message);
          }
    }

    // send a text
    async sendText(message) {
        const PRODUCTION_NUMBER = '3312156629';
        const AUSTIN_NUMBER = '9522502550';
        const validSports = "bfhmBFHM";

        try {
            // see if we have permission to send a text
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.SEND_SMS,
                {
                    'title': 'Lucidata Send SMS Permission',
                    'message': 'Lucidata needs SMS permission in order to communicate with the server.'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Permission to send sms granted")

                if (validSports.indexOf(message[0]) != -1) {
                    const dateString = "" + this.state.selectedDate.year +
                        this.state.selectedDate.month + this.state.selectedDate.day;
                    const messageToSend = "s" + message[0] + dateString;
                    console.log(messageToSend);
                    // show the loading spinner while waiting for response
                    this.setState({awaitingText: true});

                    // if we have permission, send the text
                    SmsAndroid.sms(
                        PRODUCTION_NUMBER, // phone number to send sms to
                        messageToSend, // sms body
                        'sendDirect', // sendDirect or sendIndirect
                        (err, message) => {
                            if (err){
                                console.log("error: ", err);
                            } else {
                                // text successfully send
                                console.log("callback message: ", message); // callback message
                            }
                        }
                    );
                } else {
                    console.log("Not valid sport, msg:", message);
                }
            }
            // if we don't have permission, just log that we don't
            else {
                console.log("SMS permission denied")
            }
        } catch (err) {
            console.warn("error from try catch: ", err)
        }
    }


    componentDidMount() {
        // rename 'this' so we can use it in callbacks
        let self = this;

        // listen for new messages
        SmsListener.addListener(message => {
            let parsedMessage = parseSms(message.body);
            // add the message to redux state's messages array if it has valid info
            if (!parsedMessage || parsedMessage.api === "not found") {
                this.props.addMessage(message);
            }

            self.setState({awaitingText: false});
        })
    }


    render() {
        // initially, wikipedia information will be empty
        let wikiInfo = null;
        let messages = this.props.messages;
        // look through the messages received to see if any are of wikipedia type
        for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex--) {
            let message = messages[messageIndex];
            if (message.api === "sports") {
                // if it is wikipedia type, show it as the info
                wikiInfo = (
                    <Text>
                        {message.info}
                    </Text>
                );
                // can only have one wikipedia info section showing at a time
                break;
            }
        }

        return (
            <View style={styles.container}>
                { wikiInfo }
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
                {this.state.awaitingText ?
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
        messages: state.messages
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
