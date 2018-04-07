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

import { parseText } from "../smsFunctions";

import { PermissionsAndroid } from 'react-native';
import SmsAndroid from 'react-native-sms-android';
import SmsListener from 'react-native-android-sms-listener';

export default class WikipediaScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            messages: [],
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
                    AUSTIN_NUMBER, // phone number to send sms to
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
            console.info(message);
            // duplicate the messages array
            let newMessages = self.state.messages.slice();
            // add the new messages to the array
            newMessages.push(message);
            self.setState({
                messages: newMessages,
                awaitingText: false
            });
        })
    }


    render() {
        let infoCounter = 0;
        // make the info we got back from sms into react elements
        const wikiInfo = this.state.messages.map(function(message) {
            return (
                <Text key={"info" + infoCounter}>
                    {message.body}
                </Text>
            )
        })

        return (
            <View style={styles.container}>
                {this.state.messages.length > 0 ? wikiInfo : null }
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
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  }
});
