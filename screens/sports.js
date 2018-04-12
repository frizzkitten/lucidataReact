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

import { PermissionsAndroid } from 'react-native';
import SmsAndroid from 'react-native-sms-android';
import SmsListener from 'react-native-android-sms-listener';

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

        this.state = {
            searchTerm: "",
            awaitingText: false
        };
    }


    // send a text
    async sendText(message) {
        const PRODUCTION_NUMBER = '3312156629';
        const AUSTIN_NUMBER = '9522502550';

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

                const messageToSend = "w," + message;

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
            if (message.api === "wikipedia") {
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
                    title="Search Wikipedia"
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

export default connect(mapStateToProps, mapDispatchToProps)(Sports);
