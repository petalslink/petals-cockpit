// base selector
const bs = `app-setup`;

export const SETUP_DOM = {
  inputs: {
    token: `${bs} input[formcontrolname=token]`,
    username: `${bs} input[formcontrolname=username]`,
    password: `${bs} input[formcontrolname=password]`,
    name: `${bs} input[formcontrolname=name]`,
  },
  buttons: {
    submit: `${bs} button`,
  },
  messages: {
    error: {
      setupFailed: `${bs} .form-error`,
    },
  },
  icons: {
    togglePwd: `${bs} .icon-toggle-pwd`,
  },
  formFields: {
    tokenFormField: `${bs} .token-form-field`,
    usernameFormField: `${bs} .username-form-field`,
    pwdFormField: `${bs} .pwd-form-field`,
    nameFormField: `${bs} .name-form-field`,
  },
};
