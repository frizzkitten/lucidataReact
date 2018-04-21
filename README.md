# lucidataReact
Lucidata SMS app for CS506, built with React Native.  

![Screenshot of Homepage](https://github.com/frizzkitten/lucidataReact/blob/master/pics/homepage.png)

## Development Environment
This will give a (hopefully) complete guide to setting up this repo for development.
1. Setup your machine following information from the React Native team [here](https://facebook.github.io/react-native/docs/getting-started.html)
2. Clone the repo and run `npm install`
3. Install the React Native CLI tool
4. Run `react-native link` to link the plugins
5. Run `react-native run-android` to have it run on your device
    - Note: there is also `react-native start`, but we have been unsuccessful getting that functional with this or any other repo (so it's probably an issue with our machine setup). If you have used React Native before there's a decent chance it will work for you.

## Testing
- Unit tests are run with `npm test`.
- Coverage is generated with `npm run coverage`.
