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

class Routes extends React.Component {
    render() {
        return <RootStack />;
    }
}

const App = () => (
    <Provider>
        <Routes />
    </Provider>
);

export default App;


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
