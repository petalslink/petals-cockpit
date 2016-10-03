import { TypedRecord, makeTypedFactory } from 'typed-immutable-record';

import { IConfig } from '../interfaces/config.interface';

// the typeScript interface that defines the application state's properties
// this is to be imported wherever a reference to a config is used
// (reducers, components, services...)
export interface ConfigState extends IConfig {};

// an Immutable.js Record implementation of the ConfigState interface.
// this only needs to be imported by reducers, since they produce new versions
// of the state
// components should only ever read the state, never change it,
// so they should only need the interface, not the record
export interface ConfigStateRecord extends TypedRecord<ConfigStateRecord>, ConfigState {};

// an Immutable.js record factory for the record
export const configStateFactory = makeTypedFactory<ConfigState, ConfigStateRecord>({
  isDarkTheme: false
});
