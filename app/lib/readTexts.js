import SmsAndroid from 'react-native-sms-android';
import parseSms from './parseSms';
import getMetaInfo from './getMetaInfo';

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
                let smsObjects = JSON.parse(smsList);
                // combine all the texts that have multiple parts
                let combinedTexts = combineTexts(smsObjects);
                combinedTexts.forEach(message => {
                    // parse the text
                    const parsedMessage = parseSms(message);

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

function combineTexts(smsObjects) {
    // the final array that will be returned, with every text being just the
    // api character and then the content of the message
    let combinedTexts = [];
    // the texts that are currently in progress of being combined
    let savedTexts = [];
    // number of texts that currently need to be found before combining
    let totalNumberTexts = undefined;
    // the type of texts that are currently being combined
    let apiType = undefined;
    // go through each text and combine any that need to be combined,
    // then add the combined texts to the redux state
    smsObjects.forEach(smsObject => {
        // get the actual message of the text object
        const fullMessage = smsObject.body;
        // meta info of the current message
        let metaInfo = undefined;
        let metaInfoSuccess = true;
        // get the api type, current text index, and number of texts in the full message
        try {
            console.log("getting meta info");
            metaInfo = getMetaInfo(fullMessage);
        }
        // if something is wrong with the formatting of the text, just return
        catch(e) {
            console.log("error getting meta info: ", e);
            metaInfoSuccess = false;
        }

        // only continue with this text if it had valid meta data
        if (metaInfoSuccess) {
            // starts a new combined text, deletes any old texts
            let startNewCombinedText = function() {
                // case that this is a self-contained text
                if (metaInfo.totalNumberTexts === 1) {
                    combinedTexts.push(metaInfo.apiType + metaInfo.content);

                    // reset other variables to get ready for next text
                    savedTexts = [];
                    totalNumberTexts = undefined;
                    apiType = undefined;
                }

                // case that this text must be combined with others
                else {
                    // set variables for this text and its successors
                    totalNumberTexts = metaInfo.totalNumberTexts;
                    apiType = metaInfo.apiType;
                    savedTexts = [{
                        textIndex: metaInfo.currentTextNumber,
                        content: metaInfo.content
                    }];
                }
            }

            // there is a message saved that needs to be combined with
            if (totalNumberTexts) {
                // if the total number of texts or api is wrong, give up on the
                // old texts and just try with the new one
                if (totalNumberTexts !== metaInfo.totalNumberTexts || metaInfo.apiType !== apiType) {
                    startNewCombinedText();
                }
                // otherwise, try to combine the text with its predecessors
                else {
                    // add the text
                    savedTexts.push({
                        textIndex: metaInfo.currentTextNumber,
                        content: metaInfo.content
                    })

                    // combine the texts if we have the right number of them
                    if (totalNumberTexts === savedTexts.length) {
                        // sort the texts so that they can be combined
                        savedTexts.sort(compareTextPlaces);

                        // make one long message with all the text content
                        let combinedMessage = apiType;
                        savedTexts.forEach(text => {
                            combinedMessage = combinedMessage + text.content;
                        })

                        // add the message to the list of all combined texts
                        combinedTexts.push(combinedMessage);

                        // reset all the variables to get ready for new messages
                        savedTexts = [];
                        totalNumberTexts = undefined;
                        apiType = undefined;
                    }
                }
            }

            // this is a new text that must either be combined or is a lone text
            else {
                startNewCombinedText();
            }
        }
        else {
            console.log("metaInfoSuccess is false");
        }
    });

    return combinedTexts;
}

function compareTextPlaces(textObjA, textObjB) {
    if (textObjA.textIndex < textObjB.textIndex) {
        return -1;
    }
    if (textObjA.textIndex > textObjB.textIndex) {
        return 1;
    }
    // if the texts have the same index for some reason
    return 0;
}
