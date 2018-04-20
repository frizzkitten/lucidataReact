import SmsAndroid from 'react-native-sms-android';
import parseSms from './parseSms';

export default function readTexts() {
    return new Promise((resolve, reject) => {
        // empty array that will contain the bodies of all Lucidata messages
        let msgs = [];

        const PRODUCTION_NUMBER = '+13312156629';
        const AUSTIN_NUMBER = '+19522502550';
        const KEVIN_NUMBER = '+17153387410';

        var filter = {
            box: 'inbox', // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued', and '' for all
            // address: '+97433------', // sender's phone number
            address: KEVIN_NUMBER,
            // the next 2 filters can be used for pagination
            indexFrom: 0, // start from index 0
            maxCount: 10, // count of SMS to return each time
        };

        // // find all the messages from Lucidata
        SmsAndroid.list(JSON.stringify(filter),
            // on error
            (fail) => {
                console.log("Error getting sms list: " + fail)
                resolve([]);
            },
            // on successful read
            (count, smsList) => {
                console.log("smsList: ", smsList);
                var smsArr = JSON.parse(smsList);
                smsArr.forEach(message => {
                    // parse the text
                    const parsedMessage = parseSms(message.body);

                    // if sms is valid, add the parsed version
                    if (parsedMessage && parsedMessage.api !== "not found") {
                        msgs.push(parsedMessage);
                    }
                });
                resolve(msgs);
            }
        );
    });
}
