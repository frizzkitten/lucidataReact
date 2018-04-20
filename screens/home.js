import React, { Component } from "react";
import { StackNavigator } from 'react-navigation';
import {
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';

export default class Home extends Component {
    render() {
        const screens = ["Wikipedia", "Weather", "Directions", "Sports"];
        const buttons = screens.map(screen => {
            return (
                <Button key={screen}
                    style={styles.screenSwitchButton}
                    title={screen}
                    onPress={() => this.props.navigation.navigate(screen)}
                />
            );
        });

        return (
            <View style={{flex: 1}}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Lucidata</Text>
                    <Text>{"Make sure to mute notifications from the Lucidata phone number in your default SMS application"}</Text>
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
