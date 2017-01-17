
export interface IBusInProgressCommon {
  // from server
  id: string;
  username: string;
  port: number;
  ip: string;

  // for UI
}

// used within table
export interface IBusInProgressRow extends IBusInProgressCommon {
  // from server
}

// used in generated views
export interface IBusInProgress extends IBusInProgressCommon { }

// used when we import a bus
export interface IBusInProgressImport extends IBusInProgressRow {
  password: string;
  passphrase: string;
}
