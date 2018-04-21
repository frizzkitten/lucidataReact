export default function getMetaInfo(text) {
    // if the text is invalid
    if (text.length < 4) {
        throw "Text not long enough.";
        return;
    }

    // first character of the text determines the api
    const API_TYPE_INDEX = 0;
    const CURRENT_TEXT_NUMBER_INDEX = 1;
    const TOTAL_NUMBER_TEXTS_INDEX = 2;

    const apiType = text.charAt(API_TYPE_INDEX);
    const currentTextNumberString = text.charAt(CURRENT_TEXT_NUMBER_INDEX);
    const totalNumberTextsString = text.charAt(TOTAL_NUMBER_TEXTS_INDEX);

    const validApis = ["s", "f", "d", "w"];

    // if the api of the text is not valid, return unsuccessfully
    if (!validApis.includes(apiType)) {
        throw "Invalid api.";
        return;
    }

    const currentTextNumber = parseInt(currentTextNumberString);
    const totalNumberTexts = parseInt(totalNumberTextsString);

    if (currentTextNumber == NaN || totalNumberTexts == NaN) {
        throw "Invalid meta info.";
        return;
    }

    // get the message without the initial meta info
    const content = text.substring(3);

    return {
        apiType,
        currentTextNumber,
        totalNumberTexts,
        content
    }
}
