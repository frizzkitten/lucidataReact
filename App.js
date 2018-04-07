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
import WikipediaScreen from "./screens/wikipedia";

import { PermissionsAndroid } from 'react-native';
import SmsAndroid from 'react-native-sms-android';
import SmsListener from 'react-native-android-sms-listener';


class HomeScreen extends Component {
    render() {
        return (
            <View style={styles.container}>
                <Button
                    title="Go to Wikipedia Screen"
                    onPress={() => this.props.navigation.navigate('Wikipedia')}
                />
            </View>
        );
    }
}


const RootStack = StackNavigator(
    {
        Home: {
            screen: HomeScreen,
        },
        Wikipedia: {
            screen: WikipediaScreen,
        }
    },
    {
        initialRouteName: "Home"
    }
);

export default class App extends React.Component {
    render() {
        return <RootStack />;
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
