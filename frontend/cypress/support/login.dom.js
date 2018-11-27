// base selector
const bs = `app-login`;

export const LOGIN_DOM = {
  inputs: {
    username: `${bs} input[formcontrolname=username]`,
    hiddenPassword: `${bs} input[formcontrolname=password][type=password]`,
    shownPassword: `${bs} input[formcontrolname=password][type=text]`,
  },
  buttons: {
    submit: `${bs} button`,
  },
  messages: {
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
