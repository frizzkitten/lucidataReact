import SmsAndroid from 'react-native-sms-android';

export default function readTexts() {
    return new Promise((resolve, reject) => {
        // empty array that will contain the bodies of all Lucidata messages
        let msgs = [];

        const PRODUCTION_NUMBER = '+13312156629';
        const AUSTIN_NUMBER = '+19522502550';

        var filter = {
            box: 'inbox', // 'inbox' (default), 'sent', 'draft', 'outbox', 'failed', 'queued', and '' for all
            // address: '+97433------', // sender's phone number
            address: PRODUCTION_NUMBER,
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
                var smsArr = JSON.parse(smsList);
                smsArr.forEach(message => {
                    msgs.push(message.body);
                });
                resolve(msgs);
            }
        );
    });
}
