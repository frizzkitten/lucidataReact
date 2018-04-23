import React, { Component } from "react";
import { StackNavigator } from 'react-navigation';

import { connect } from 'react-redux';
import { ActionCreators } from './app/actions';
import { bindActionCreators } from 'redux';

import parseSms from "./app/lib/parseSms";
import getMetaInfo from "./app/lib/getMetaInfo";
import SmsListener from 'react-native-android-sms-listener';

import { Keyboard } from 'react-native';


// import all the screens
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
    constructor(props) {
        super(props);

        this.state = {
            messagesBeingParsed: [],
            totalNumberTexts: undefined,
            api: undefined
        }
    }


    componentDidMount() {
        // rename 'this' so we can use it in callbacks
        let self = this;

        // listen for when keyboard is open or hidden
        self.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', self._keyboardDidShow.bind(self));
        self.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', self._keyboardDidHide.bind(self));

        // listen for new messages
        SmsListener.addListener(message => {
            let metaInfo = undefined;
            // get the api type, current text index, and number of texts in the full message
            try {
                console.log("getting meta info");
                metaInfo = getMetaInfo(message.body);
            }
            // if something is wrong with the formatting of the text, just return
            catch(e) {
                console.log("error getting meta info: ", e);
                return;
            }

            // if there is an unfinished message in state and the current text
            // does not match its api, get rid of the old stuff in state
            // do the same if there is no info for the api in state
            if (!this.state.api || this.state.api !== metaInfo.apiType) {
                console.log("no api or different api");
                console.log("metaInfo: ", metaInfo);
                this.setState({
                    api: metaInfo.apiType,
                    totalNumberTexts: metaInfo.totalNumberTexts,
                    messagesBeingParsed: []
                }, () => {
                    // then set the message that we just got
                    self.addMessageAndMaybeAddToReduxState(metaInfo.currentTextNumber, metaInfo.content)
                });
            }
            // if we're adding a message that is not the first of its type within the api
            else {
                console.log("same api as before");
                self.addMessageAndMaybeAddToReduxState(metaInfo.currentTextNumber, metaInfo.content);
            }
        })
    }


    // tell everything else when the keyboard is showing
    _keyboardDidShow() {
        this.props.setKeyboardShowing(true);
    }

    // tell everything else when the keyboard is hidden
    _keyboardDidHide() {
        this.props.setKeyboardShowing(false);
    }


    addMessageAndMaybeAddToReduxState(textIndex, textContent) {
        let self = this;
        let allMessages = this.state.messagesBeingParsed.slice();
        allMessages.push({
            content: textContent,
            index: textIndex
        });

        console.log("adding message to state");
        this.setState({messagesBeingParsed: allMessages}, () => {
            // if we have all the texts in the message, combine them, parse it,
            // and add it to the redux state
            console.log("this.state: ", this.state);
            if (this.state.messagesBeingParsed.length === this.state.totalNumberTexts) {
                // remake the messages array just in case some funky business
                // happened while state was being updated
                let messages = this.state.messagesBeingParsed.slice();

                // sort the texts
                messages.sort(self.compareTextPlaces);

                // make one long message with all the text content
                let message = self.state.api;
                messages.forEach(text => {
                    message = message + text.content;
                })

                // parse the big fat message
                let parsedMessage = parseSms(message);
                console.log("parsed message is: ", parsedMessage);

                // add the message to redux state's messages array if it has valid info
                if (parsedMessage && parsedMessage.api !== "not found") {
                    self.props.addMessage(parsedMessage);
                }

                // finished waiting for the text, deactivate loading spinner
                self.props.setAwaitingText(false);

                // no longer need the messages in state, get rid of them
                self.setState({
                    messagesBeingParsed: [],
                    totalNumberTexts: undefined,
                    api: undefined
                })
            }
        });
    }


    compareTextPlaces(textObjA, textObjB) {
        if (textObjA.index < textObjB.index) {
            return -1;
        }
        if (textObjA.index > textObjB.index) {
            return 1;
        }
        // if the texts have the same index for some reason
        return 0;
    }


    render() {
        return <RootStack />;
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(ActionCreators, dispatch);
}

function mapStateToProps(state) {
    return {
        awaitingText: state.awaitingText
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Routes);
