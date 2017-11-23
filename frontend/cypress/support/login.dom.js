// base selector
const bs = `app-login`;

export const LOGIN_DOM = {
  inputs: {
    username: `${bs} input[formcontrolname="username"]`,
    password: `${bs} input[formcontrolname="password"]`,
  },
  buttons: {
    submit: `${bs} button`,
  },
  messages: {
    error: {
      loginFailed: `${bs} .form-error`,
    },
  },
};
