import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  FlatList,
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
            this.props.setAwaitingText(true);
            sendSms(messageToSend)
            .catch(err => {
                console.log("error sending text: ", error);
            })
        } else {
            console.log("Wiki: message empty");
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
        let wikiData = [];
        let messages = this.props.messages;
        // look through the messages received to see if any are of wikipedia type
        for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
            let message = messages[messageIndex];
            if (message.api === "wikipedia") {
                // if it is wikipedia type, show it as the info
                wikiData.push(message);
            }
        }

        // add keys so react-native shuts up
        for (i in wikiData) {
            wikiData[i].key = i;
        }

        console.log("wikiData: ", wikiData);

        return (
            <View style={{flex: 1}}>
                {this.props.keyboardShowing ?
                    null :
                    <View style={styles.flatlist}>
                        <FlatList
                            data={wikiData}
                            ItemSeparatorComponent = {this.FlatListItemSeparator}
                            renderItem={({item}) => <Text style={styles.item}>{item.info}</Text>}
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
                            title="Search Wikipedia"
                            color="#841584"
                        />
                    </View>
                    <View style={styles.spacedView}>
                        <Text style={{textAlign: 'center'}}>
                            {"Enter anything you want to search wikipedia for!"}
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
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  flatlist: {
      flex: 3
  },
  item: {
      padding: 12,
      fontSize: 14,
      height: 120
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

export default connect(mapStateToProps, mapDispatchToProps)(Wikipedia);
