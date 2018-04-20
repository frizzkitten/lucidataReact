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

import { PermissionsAndroid } from 'react-native';
import SmsAndroid from 'react-native-sms-android';
import SmsListener from 'react-native-android-sms-listener';

class Wikipedia extends Component {
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
        const messageToSend = "w" + message;

        if (message != "") {
        // show the loading spinner while waiting for response
            this.setState({awaitingText: true});
            sendSms(messageToSend)
            .catch(err => {
                console.log("error sending text: ", error);
            })
        } else {
            console.log("Wiki: message empty");
        }
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
        // look through the messages received to see if any are of wikipedia type
        for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
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

export default connect(mapStateToProps, mapDispatchToProps)(Wikipedia);
