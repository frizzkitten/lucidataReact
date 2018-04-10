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

import { parseText } from "../smsFunctions";

import { PermissionsAndroid } from 'react-native';
import SmsAndroid from 'react-native-sms-android';
import SmsListener from 'react-native-android-sms-listener';

class WikipediaScreen extends Component {
    constructor(props) {
        super(props);

        // empty array that will contain the bodies of all Lucidata messages
        let messages = [];

        const PRODUCTION_NUMBER = '+13312156629';
        const AUSTIN_NUMBER = '+19522502550';

        var filter = {
            box: 'inbox', // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued', and '' for all
            // address: '+97433------', // sender's phone number
            address: AUSTIN_NUMBER,
            // the next 2 filters can be used for pagination
            indexFrom: 0, // start from index 0
            maxCount: 10, // count of SMS to return each time
        };

        // // find all the messages from Lucidata
        SmsAndroid.list(JSON.stringify(filter),
            // on error
            (fail) => {
                console.log("Error getting sms list: " + fail)
            },
            // on successful read
            (count, smsList) => {
                var smsArr = JSON.parse(smsList);
                smsArr.forEach(message => {
                    messages.push(message.body);
                });
                this.props.setMessages(messages);
            }
        );

        this.state = {
            messages: messages,
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
            console.log(message);
            // duplicate the messages array
            let newMessages = self.state.messages.slice();
            // add the new messages to the array
            newMessages.push(message.body);

            // add the message to redux state's messages array
            this.props.addMessage(message.body);

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
            infoCounter++;
            return (
                <Text key={"info" + infoCounter}>
                    {message}
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

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}

// export default WikipediaScreen;

export default connect(() => { return {} }, mapDispatchToProps)(WikipediaScreen);
