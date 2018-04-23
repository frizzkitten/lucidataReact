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
        newMessages.unshift(action.message);
        // return the new state
        return newMessages;
    }
});

export const awaitingText = createReducer([], {
    "SET_AWAITING_TEXT"(state, action) {
        return action.awaitingText;
    }
})

export const keyboardShowing = createReducer([], {
    "SET_KEYBOARD_SHOWING"(state, action) {
        return action.keyboardShowing;
    }
})
