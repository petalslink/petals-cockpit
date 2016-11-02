// typed-record
import { TypedRecord } from 'typed-immutable-record';

export interface IConfig {
  isDarkTheme: boolean;
}

export interface IConfigRecord extends TypedRecord<IConfigRecord>, IConfig { };
