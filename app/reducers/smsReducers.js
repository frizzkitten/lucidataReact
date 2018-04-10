import createReducer from '../lib/createReducer';

export const fakeReducer = createReducer({}, {

});

export const messages = createReducer([], {
    "SET_MESSAGES"(state, action) {
        // make the messages array simply the array that is passed in
        return action.messages;
    },

    "ADD_MESSAGE"(state, action) {
        // copy the old messages state array
        let newMessages = state.slice();
        // add the new message
        newMessages.push(action.message);
        // return the new state
        return newMessages;
    }
});
