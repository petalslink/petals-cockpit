// angular module
import { AbstractControl } from '@angular/forms';

export class CustomValidators {
  static isIp(c: AbstractControl) {
    const ipRegexp = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/;

    return ipRegexp.test(c.value) ? null : {
      isIp: {
        valid: false
      }
    };
  }

  static isPort(c: AbstractControl) {
    const portRegexp = /^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;

    return portRegexp.test(c.value) ? null : {
      isPort: {
        valid: false
      }
    };
  }
}
