import { makeTypedFactory } from 'typed-immutable-record';

import { IConfig, IConfigRecord } from '../interfaces/config.interface';

export const configFactory = makeTypedFactory<IConfig, IConfigRecord>({
  isDarkTheme: false
});
