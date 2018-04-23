import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  View,
  Button,
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
import getLocation from "../app/lib/getLocation";

import { PermissionsAndroid } from 'react-native';
import SmsAndroid from 'react-native-sms-android';
import SmsListener from 'react-native-android-sms-listener';

class Weather extends Component {
    constructor(props) {
        super(props);

        readTexts()
        .then(msgs => {
            this.props.setMessages(msgs);
        })
        .catch(err => {
            console.log("Error getting messages");
        });

        this.state = {
            searchTerm: "",
            awaitingText: false
        };
    }


    // send a text
    async getLocationAndSendText(destination, updateType) {
        // hide the keyboard
        Keyboard.dismiss();

        // show the loading spinner while waiting for response
        this.props.setAwaitingText(true);

        // if destination not entered, use current location
        if (destination === "") {
            // get the current location
            getLocation()
            .then(location => {
                const latitude = location.coords.latitude.toString();
                const longitude = location.coords.longitude.toString();
                let messageToSend = "fc" + updateType + latitude + "," + longitude;

                // sent the message with the directions info we want
                sendSms(messageToSend)
                .catch(err => {
                    console.log("error sending text: ", error);
                })
            })
            .catch(error => {
                console.log("error getting location info: ", error);
            });
        }
        // otherwise use the location provided
        else {
            let messageToSend = "fa" + updateType + destination;
            // sent the message with the directions info we want
            sendSms(messageToSend)
            .catch(err => {
                console.log("error sending text: ", error);
            })
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


    render() {
        // initially, wikipedia information will be empty
        let wikiInfo = null;
        let messages = this.props.messages;
        let directionsHtml = null;

        try {
            // look through the messages received to see if any are of wikipedia type
            for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
                let message = messages[messageIndex];
                if (message.api === "weather") {
                    let keyCounter = 0;
                    switch (message.weatherType) {
                        case "Alerts":
                            // simply write out the list of alerts
                            directionsHtml = message.alerts.map(alert => {
                                keyCounter++;
                                return {
                                    key: keyCounter.toString(),
                                    html: (
                                        <Text>
                                            {alert}
                                        </Text>
                                    )
                                }
                            })
                            break;
                        case "24 Hour":
                            directionsHtml = message.infoArr.map(hourInfo => {
                                let hour = hourInfo.hour ? hourInfo.hour : null;
                                let info =  hourInfo.info ? hourInfo.info : null;
                                let temp =  hourInfo.temp ? hourInfo.temp : null;
                                let precip =  hourInfo.precip ? hourInfo.precip : null;
                                let precipChance =  hourInfo.precipChance ? hourInfo.precipChance : null;
                                keyCounter++;
                                return {
                                    key: keyCounter.toString(),
                                    html: (
                                        <Text>
                                            <Text style={styles.bold}>Hour:</Text> {hour}{"\n"}
                                            {info}{"\n"}
                                            <Text style={styles.bold}>Temperature:</Text> {temp}{"\n"}
                                            {precip && precipChance ?
                                                precipChance + "% chance of " + precip + "\n"
                                                : null
                                            }
                                        </Text>
                                    )
                                }
                            });

                            break;
                        case "7 Day":
                            directionsHtml = message.infoArr.map(dayInfo => {
                                let day = dayInfo.hour ? dayInfo.hour : null;
                                let info =  dayInfo.info ? dayInfo.info : null;
                                let high =  dayInfo.high ? dayInfo.high : null;
                                let low =  dayInfo.low ? dayInfo.low : null;
                                let precip =  dayInfo.precip ? dayInfo.precip : null;
                                let precipChance =  dayInfo.precipChance ? dayInfo.precipChance : null;
                                keyCounter++;
                                return {
                                    key: keyCounter.toString(),
                                    html: (
                                        <Text>
                                            Day: {day}{"\n"}
                                            {info}{"\n"}
                                            High: {high}{"\n"}
                                            Low: {low}{"\n"}
                                            {precip && precipChance ?
                                                precipChance + "% chance of " + precip + "\n"
                                                : null
                                            }
                                        </Text>
                                    )
                                }
                            });
                            break;
                        default:
                            break;
                    }
                    // can only have one weather update at a time
                    break;
                }
            }
        }
        catch(e) {
            console.log("Failed getting directionsHtml: ", e);
            directionsHtml = null;
        }

        return (
            <View style={{flex: 1}}>
                {this.props.keyboardShowing ?
                    null :
                    <View style={styles.flatlist}>
                        <FlatList
                            data= {directionsHtml}
                            ItemSeparatorComponent = {this.FlatListItemSeparator}
                            renderItem={({item}) => <Text style={styles.item} key={item.key}>{item.html}</Text>}
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
                            onPress={() => this.getLocationAndSendText(this.state.searchTerm, "a")}
                            title="Get Weather Alerts"
                            color="#841584"
                        />
                    </View>
                    <View style={styles.spacedView}>
                        <Button
                            onPress={() => this.getLocationAndSendText(this.state.searchTerm, "2")}
                            title="Get 24 Hour Forecast"
                            color="#841584"
                        />
                    </View>
                    <View style={styles.spacedView}>
                        <Button
                            onPress={() => this.getLocationAndSendText(this.state.searchTerm, "7")}
                            title="Get 7 Day Forecast"
                            color="#841584"
                        />
                    </View>
                    <View style={styles.spacedView}>
                        <Text style={styles.centered}>
                            {"Enter address or leave blank to use your current location."}
                        </Text>
                    </View>
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    bold: {
        fontWeight: 'bold'
    },
    flatlist: {
        flex: 1
    },
    item: {
        padding: 12,
        fontSize: 14,
        height: 120
    },
    spacedView: {
        margin: 5
    },
    centered: {
        textAlign: 'center'
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

export default connect(mapStateToProps, mapDispatchToProps)(Weather);
