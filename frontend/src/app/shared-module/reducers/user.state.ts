import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { IUser } from '../interfaces/user.interface';

// the typeScript interface that defines the application state's properties
// this is to be imported wherever a reference to a user is used
// (reducers, components, services...)
export interface UserState extends IUser {
    isConnecting: boolean;
    isDisconnecting: boolean;
    isConnected: boolean;
    connectionFailed: boolean;
};

// an Immutable.js Record implementation of the UserState interface.
// this only needs to be imported by reducers, since they produce new versions
// of the state
// components should only ever read the state, never change it,
// so they should only need the interface, not the record
export interface UserStateRecord extends TypedRecord<UserStateRecord>, UserState {};

// an Immutable.js record factory for the record
export const userStateFactory = makeTypedFactory<UserState, UserStateRecord>({
    isConnecting: false,
    isDisconnecting: false,
    isConnected: false,
    connectionFailed: false
});
