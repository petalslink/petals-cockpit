
export interface IBusInProgressCommon {
  // from server
  id: string;
  importUsername: string;
  importPort: number;
  importIp: string;

  // for UI
}

// used within table
export interface IBusInProgressRow extends IBusInProgressCommon {
  // from server
}

// used in generated views
export interface IBusInProgress extends IBusInProgressCommon { }

// used when we import a bus
export interface INewBus extends IBusInProgressRow {
  password: string;
  passphrase: string;
}
