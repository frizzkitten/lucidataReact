import { combineReducers } from 'redux';
import * as smsReducer from './smsReducers';

export default combineReducers(Object.assign({},
    smsReducer
))
