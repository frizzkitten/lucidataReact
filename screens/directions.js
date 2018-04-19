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
import sendSms from "../app/lib/sendSms";
import getLocation from "../app/lib/getLocation";

import { PermissionsAndroid } from 'react-native';
import SmsAndroid from 'react-native-sms-android';
import SmsListener from 'react-native-android-sms-listener';

class Direction extends Component {
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
    async getLocationAndSendText(destination) {
        // show the loading spinner while waiting for response
        this.setState({awaitingText: true});
        getLocationAndSendText(destination);
    }


    componentDidMount() {
        // rename 'this' so we can use it in callbacks
        let self = this;

        // listen for new messages
        SmsListener.addListener(message => {
            let parsedMessage = parseSms(message.body);
            console.log("parsed message is: ", parsedMessage);

            // add the message to redux state's messages array if it has valid info
            if (parsedMessage && parsedMessage.api !== "not found") {
                this.props.addMessage(parsedMessage);
            }

            self.setState({awaitingText: false});
        })
    }


    render() {
        // initially, wikipedia information will be empty
        let wikiInfo = null;
        let messages = this.props.messages;
        let directionsHtml = null;
        // look through the messages received to see if any are of wikipedia type
        for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
            let message = messages[messageIndex];
            if (message.api === "directions") {
                // if it is wikipedia type, show it as the info
                if (Array.isArray(message.directionsList)){
                    directionsHtml = message.directionsList.map(direction => {
                        return (
                            <View>
                                <Text>
                                    <Text style={styles.bold}>Distance:</Text> {direction.distance}
                                </Text>
                                <Text>
                                    {direction.info}
                                </Text>
                            </View>
                        );
                    });
                }
                // can only have one wikipedia info section showing at a time
                break;
            }
        }

        return (
            <View style={styles.container}>
                { directionsHtml }
                <TextInput
                    style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(searchTerm) => this.setState({searchTerm})}
                    value={this.state.searchTerm}
                />
                <Button
                    onPress={() => this.getLocationAndSendText(this.state.searchTerm)}
                    title="Find Directions"
                    color="#841584"
                />
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
    },
    bold: {
        fontWeight: 'bold'
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

export const getLocationAndSendText = (destination) => {
      // get the current location
      getLocation()
      .then(location => {
          const latitude = location.coords.latitude.toString();
          const longitude = location.coords.longitude.toString();
          let messageToSend = "d," + latitude + "," + longitude + ";" + destination;
          console.log(messageToSend)
          // sent the message with the directions info we want
          sendSms(messageToSend)
          .catch(err => {
              console.log("error sending text: ", error);
          })
      })
      .catch(error => {
          console.log("error getting location info: ", error);
      });
};
 

export default connect(mapStateToProps, mapDispatchToProps)(Direction);
