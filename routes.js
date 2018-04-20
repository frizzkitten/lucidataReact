import React, { Component } from "react";

import { addMessage, setWaitingStatus } from "./app/actions/smsActions";
import parseSms from "./app/lib/parseSms";
import SmsListener from 'react-native-android-sms-listener';

import { StackNavigator } from 'react-navigation';

import Wikipedia from "./screens/wikipedia";
import Weather from "./screens/weather";
import Directions from "./screens/directions";
import Sports from "./screens/sports";
import Home from "./screens/home";

const RootStack = StackNavigator(
    {
        Home: { screen: Home },
        Wikipedia: { screen: Wikipedia },
        Weather: { screen: Weather },
        Sports: { screen: Sports },
        Directions: { screen: Directions },
    },
    {
        initialRouteName: "Home"
    }
);


class Routes extends Component {
    // componentDidMount() {
    //     // rename 'this' so we can use it in callbacks
    //     let self = this;
    //
    //     // listen for new messages
    //     SmsListener.addListener(message => {
    //         let parsedMessage = parseSms(message.body);
    //         console.log("parsed message is: ", parsedMessage);
    //
    //         // add the message to redux state's messages array if it has valid info
    //         if (parsedMessage && parsedMessage.api !== "not found") {
    //             this.props.addMessage(parsedMessage);
    //         }
    //
    //         //self.setState({awaitingText: false});
    //         self.props.setWaitingStatus(false);
    //     })
    // }

    render() {
        return <RootStack />;
    }
}

export default Routes;
