interface IUserCommon {
  // from server
  id: string;
  name: string;
  username: string;
  lastWorkspace: string;

  // for UI
  password: string;
}

// used within table
export interface IUserRow extends IUserCommon { }

// used in generated views
export interface IUser extends IUserCommon { }
