// base selector
const bs = `app-login`;

export const LOGIN_DOM = {
  inputs: {
    username: `${bs} input[formcontrolname=username]`,
    password: `${bs} input[formcontrolname=password]`,
  },
  buttons: {
    submit: `${bs} button`,
  },
  messages: {
    valid: {
      setupSucceeded: `${bs} .msg-add-setup-user`,
    },
    error: {
      loginFailed: `${bs} .form-error`,
    },
  },
  icons: {
    togglePwd: `${bs} .icon-toggle-pwd`,
  },
  formFields: {
    usernameFormField: `${bs} .username-form-field`,
    pwdFormField: `${bs} .pwd-form-field`,
  },
};
