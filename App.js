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
import Wikipedia from "./screens/wikipedia";
import Weather from "./screens/weather";
import Directions from "./screens/directions";
import Sports from "./screens/sports";

import { PermissionsAndroid } from 'react-native';
import SmsAndroid from 'react-native-sms-android';
import SmsListener from 'react-native-android-sms-listener';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';

import reducer from './app/reducers';

const loggerMiddleware = createLogger({ predicate: (getState, action) => __DEV__ });

function configureStore(initialState) {
    const enhancer = compose(
        applyMiddleware(
            thunkMiddleware,
            loggerMiddleware,
        ),
    );
    return createStore(reducer, initialState, enhancer);
}

const store = configureStore({});


class HomeScreen extends Component {
    render() {
        const screens = ["Wikipedia", "Weather", "Directions", "Sports"];
        const buttons = screens.map(screen => {
            return (
                <Button key={screen}
                    style={styles.screenSwitchButton}
                    title={screen}
                    onPress={() => this.props.navigation.navigate(screen)}
                />
            )
        });

        return (
            <View style={{flex: 1}}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Lucidata</Text>
                </View>
                <View style={{flex: 2, flexDirection: 'row'}}>
                    <View style={styles.container}>
                     { buttons[0] }
                    </View>
                    <View style={styles.container}>
                     { buttons[1] }
                    </View>
                </View>
                <View style={{flex: 2, flexDirection: 'row'}}>
                <View style={styles.container}>
                     { buttons[2] }
                    </View>
                    <View style={styles.container}>
                     { buttons[3] }
                    </View>
                </View>    
            </View>
        );
    }
}


const RootStack = StackNavigator(
    {
        Home: { screen: HomeScreen },
        Wikipedia: { screen: Wikipedia },
        Weather: { screen: Weather },
        Sports: { screen: Sports },
        Directions: { screen: Directions },
    },
    {
        initialRouteName: "Home"
    }
);

class Routes extends React.Component {
    render() {
        return <RootStack />;
    }
}

const App = () => (
    <Provider store={store}>
        <Routes />
    </Provider>
);

export default App;


const styles = StyleSheet.create({
    screenSwitchButton: {
        margin: 5
    },
    container: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    titleContainer: {
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
    title: {
        fontWeight: 'bold',
        fontFamily: 'Courier New',
        fontSize: 54,
        fontStyle: 'italic',
        letterSpacing: 3,
        textShadowColor: '#d6e0f5',
        textShadowOffset: {width: 8, height: 8},
        color: '#004de6'
    }
});
