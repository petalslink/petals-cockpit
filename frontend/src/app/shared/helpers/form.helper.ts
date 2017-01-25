import { FormGroup } from '@angular/forms';

export const validationMessages = {
  'ip': {
    'required': 'Required !',
    'isIp': 'Invalid IP format'
  },
  'port': {
    'required': 'Required !',
    'isPort': 'Invalid port format. Should be 0 <= port <= 65535'
  },
  'username': {
    'required': 'Required !'
  },
  'password': {
    'required': 'Required !'
  },
  'passphrase': {
    'required': 'Required !'
  }
};

export function getFormErrors(form: FormGroup, formFields: { [key: string]: string }, data?: any): any {
  const formFieldsTmp = Object.assign({}, formFields);

  for (const field in formFieldsTmp) {
    if (formFieldsTmp.hasOwnProperty(field)) {
      formFieldsTmp[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = validationMessages[field];
        for (const key in control.errors) {
          if (control.errors.hasOwnProperty(key)) {
            formFieldsTmp[field] += messages[key] + ' ';
            break;
          }
        }
      }
    }
  }

  return formFieldsTmp;
}

export function enableAllFormFields(form: FormGroup) {
  _enableOrDisableAllFormFields(form, true);
}

export function disableAllFormFields(form: FormGroup) {
  _enableOrDisableAllFormFields(form, false);
}

export function _enableOrDisableAllFormFields(form: FormGroup, enable: boolean) {
  for (const key in form.controls) {
    if (form.controls.hasOwnProperty(key)) {
      if (enable) {
        form.controls[key].enable();
      } else {
        form.controls[key].disable();
      }
    }
  }
}
