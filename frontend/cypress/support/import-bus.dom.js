// base selector
const bs = `app-petals-bus-in-progress-view`;

export const IMPORT_BUS_DOM = {
  inputs: {
    ip: `${bs} input[formcontrolname="ip"]`,
    port: `${bs} input[formcontrolname="port"]`,
    username: `${bs} input[formcontrolname="username"]`,
    password: `${bs} input[formcontrolname="password"]`,
    passphrase: `${bs} input[formcontrolname="passphrase"]`,
  },
  buttons: {
    clear: `${bs} .btn-clear-form`,
    discard: `${bs} .btn-discard-form`,
    submit: `${bs} .btn-import-form`,
  },
};
