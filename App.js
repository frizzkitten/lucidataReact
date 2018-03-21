/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';

import SmsAndroid from 'react-native-sms-android';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
    sendText() {
        console.log("HERE");
        SmsAndroid.sms(
            '9522502550', // phone number to send sms to
            'FRIZZKITTEN THIS IS FROM LUCIDATA TELL ME IF YOU GET IT', // sms body
            'sendDirect', // sendDirect or sendIndirect
            (err, message) => {
                if (err){
                    console.log("error: ", err);
                } else {
                    console.log("callback message: ", message); // callback message
                }
            }
        );
    }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit App.js
        </Text>
        <Text style={styles.instructions}>
          {instructions}
        </Text>
        <Button
          onPress={this.sendText}
          title="Send Text"
          color="#841584"
          accessibilityLabel="yuh"
        />
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
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
