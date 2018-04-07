import { combineReducers } from 'redux';
import * as smsReducer from './sms';

export default combineReducers(Object.assign({},
    smsReducer
))
