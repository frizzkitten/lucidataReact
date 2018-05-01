export default function parseSms(message) {
    if (typeof message === "string" && message.length > 0) {
        // remove twilio trial account message if it exists
        let twilioTrialAccountMessage = "Sent from your Twilio trial account - ";
        if (message.includes(twilioTrialAccountMessage)) {
            message = message.substring(twilioTrialAccountMessage.length);
        }

        // the first letter of the message determines which api it is for
        let apiChar = message.charAt(0);
        const API_TYPE_INDEX = 0;
        switch (apiChar) {
            // using wikipedia api
            case "w":
                let info = "No info found about that topic :(";
                // if the message has info in it, return that info
                if (message.length > API_TYPE_INDEX + 2) {
                    info = message.substring(API_TYPE_INDEX + 1);
                }
                return {api: "wikipedia", info: info};
            case "d":
                // if directions not found, return object with notFound set to true
                if (message.includes("not found")) {
                    // if returned message has place that was searched for,
                    // include that
                    let destination = undefined;
                    if (message.indexOf(" to ") >= 0) {
                        destination = message.substring(message.indexOf(" to ")+ 4);
                    }
                    return {api: "directions", notFound: true, destination};
                }

                let directionsList = [];
                // if the message has info in it, return that info
                if (message.length > API_TYPE_INDEX + 2) {
                    // the message without the comma, so only relevant information
                    const noCommaMessage = message.substring(API_TYPE_INDEX + 2);
                    // split into a list of non-formatted directions
                    const directionsPreFormat = noCommaMessage.split(";");
                    // split each direction into a mile amount and then information
                    directionsList = directionsPreFormat.map(direction => {
                        let distance = "";
                        let info = "";
                        try {
                            const distanceStart = 1;
                            const distanceEnd = direction.indexOf(')');
                            distance = direction.substring(distanceStart, distanceEnd);
                            info = direction.substring(distanceEnd + 1);
                        } catch (err) {
                            return {};
                        }
                        return { distance, info };
                    });
                }
                return {api: "directions", directionsList: directionsList};
            case "f":
                // if the message has info in it, return that info
                if (message.length > API_TYPE_INDEX + 2) {
                    try {
                        // the message without the comma, so only relevant information
                        const onlyContent = message.substring(API_TYPE_INDEX + 2);
                        // split into a list of non-formatted directions
                        const weatherType = message.charAt(API_TYPE_INDEX + 1);

                        switch (weatherType) {
                            case "a":
                                // const weatherPreFormat = onlyContent.split("/");
                                // const weatherPostFormat = weatherPreFormat.map(weatherString => {
                                //     return weatherString.substring(1);
                                // });
                                //return {api: "weather", weatherType: "Alerts", alerts: weatherPostFormat};
                                return {api: "weather", weatherType: "Alerts", alerts: onlyContent.split("/")}
                            case "2":
                                const hoursPreFormat = onlyContent.split("/");
                                // get current hour of the day
                                let currHour = (new Date()).getHours();

                                let hoursInfoArr = [];
                                hoursPreFormat.forEach(hourInfo => {
                                    if (hourInfo !== "") {
                                        currHour++;
                                        if (currHour === 24) {
                                            currHour = 0;
                                        }
                                        let infoObj = {hour: currHour};
                                        const infoArr = hourInfo.split(";");
                                        let counter = 0;
                                        infoArr.forEach(information => {
                                            counter++;
                                            switch (counter) {
                                                case 1:
                                                    infoObj.info = information;
                                                    break;
                                                case 2:
                                                    infoObj.temp = information;
                                                    break;
                                                case 3:
                                                    infoObj.precip = information;
                                                    break;
                                                case 4:
                                                    infoObj.precipChance = information;
                                                    break;
                                                default:
                                                    break;
                                            }
                                        })

                                        // at this point we should have an array of
                                        // {
                                        //      hour: 15,
                                        //      info: "aasdfasdf",
                                        //      temp: "23"
                                        //      precip: "snow"
                                        //      precipChance: "33"
                                        // }
                                        hoursInfoArr.push(infoObj);
                                    }
                                });
                                return {api: "weather", weatherType: "24 Hour", infoArr: hoursInfoArr};
                            case "7":
                                const daysPreFormat = onlyContent.split("/");
                                // current day is first
                                let currDay = 0;

                                let daysInfoArr = [];
                                daysPreFormat.forEach(dayInfo => {
                                    if (dayInfo !== "") {
                                        currDay++;
                                        let infoObj = {day: currDay};
                                        const infoArr = dayInfo.split(";");
                                        let counter = 0;
                                        infoArr.forEach(information => {
                                            counter++;
                                            switch (counter) {
                                                case 1:
                                                    infoObj.info = information;
                                                    break;
                                                case 2:
                                                    infoObj.high = information;
                                                    break;
                                                case 3:
                                                    infoObj.low = information;
                                                    break;
                                                case 4:
                                                    infoObj.precip = information;
                                                    break;
                                                case 5:
                                                    infoObj.precipChance = information;
                                                    break;
                                                default:
                                                    break;
                                            }
                                        })

                                        // at this point we should have an array of
                                        // {
                                        //      day: 4,
                                        //      info: "aasdfasdf",
                                        //      temp: "23"
                                        //      precip: "snow"
                                        //      precipChance: "33"
                                        // }
                                        daysInfoArr.push(infoObj);
                                    }
                                });
                                return {api: "weather", weatherType: "7 Day", infoArr: daysInfoArr};
                            default:
                                // if weather type is not one of these, can't parse
                                return {api: "not found"};
                        }

/* TODO: Austin did you mean to put this here? */
                    //     // split each direction into a mile amount and then information
                    //     directionsList = directionsPreFormat.map(direction => {
                    //         let distance = "";
                    //         let info = "";
                    //         try {
                    //             const distanceStart = 1;
                    //             const distanceEnd = direction.indexOf(')');
                    //             distance = direction.substring(distanceStart, distanceEnd);
                    //             info = direction.substring(distanceEnd + 1);
                    //         } catch (err) {
                    //             return {};
                    //         }
                    //         return { distance, info };
                    //     });
                    }
                    catch (parseError) {
                        console.log("error parsing weather info: ", parseError);
                        return {api: "not found"}
                    }
                }
                // if text doesn't have enough info, return not found
                else {
                    return {api: "not found"};
                }
            case "s":
                return {api: "sports", data: message};
            default:
                return {api: "not found"};
        }

    }
    // if the message to parse is not a valid message, return error string
    else {
        return {api: "not found"};
    }
}
