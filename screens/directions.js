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
        // hide the keyboard
        Keyboard.dismiss();

        // show the loading spinner while waiting for response
        this.props.setAwaitingText(true);
        getLocationAndSendText(destination);
    }

    formatDirections(item) {
        // if no directions found
        if (item.notFound === true) {
            let returnString = "Could not find directions";
            if (typeof item.destination === "string") {
                returnString = returnString + " to " + item.destination;
            }
            return (<Text>{returnString}</Text>);
        }
        else {
            return (
                <Text>
                    <Text style={styles.bold}>
                        {"Distance:   "}{item.distance}
                    </Text>
                    <Text style={styles.item}>
                        {item.info}
                    </Text>
                </Text>
            )
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
        let messages = this.props.messages;
        let directionsList = [];
        // look through the messages received to see if any are of directions type
        for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
            let message = messages[messageIndex];
            if (message.api === "directions") {
                // if the directions are not found, add an object with 'not found' properties
                if (message.notFound) {
                    directionsList = [{notFound: true, destination: message.destination}];
                }
                // otherwise add the directions
                else {
                    directionsList =  directionsList.concat(message.directionsList);
                }
                // only want directions to one place at a time
                break;
            }
        }

        console.log('directionsList: ', directionsList);

        // add keys so react-native shuts up
        for (i in directionsList) {
            directionsList[i].key = i;
        }

        return (
            <View style={{flex:1}}>
                {this.props.keyboardShowing ?
                    null :
                    <View style={styles.flatlist}>
                        <FlatList
                            data={directionsList}
                            ItemSeparatorComponent = {this.FlatListItemSeparator}
                            renderItem={({item}) => <View>{this.formatDirections(item)}</View>}
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
                            onPress={() => this.getLocationAndSendText(this.state.searchTerm)}
                            title="Find Directions"
                            color="#841584"
                        />
                    </View>
                    <View style={styles.spacedView}>
                        <Text>
                            {"Choose a location to get directions to."}
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
    bold: {
        fontWeight: 'bold'
    },
    flatlist: {
        flex: 3
    },
    item: {
        padding: 12,
        fontSize: 14,
        height:60
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

export const getLocationAndSendText = (destination) => {
      // get the current location
      getLocation()
      .then(location => {
          const latitude = location.coords.latitude.toString();
          const longitude = location.coords.longitude.toString();
          let messageToSend = "d" + latitude + "," + longitude + ";" + destination;

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
