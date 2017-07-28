/**
 * Copyright (C) 2017 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { $, browser, ExpectedConditions as EC } from 'protractor';

import { waitTimeout } from '../common';
import { urlToMatch } from '../utils';

export abstract class BusInProgressFields {
  public static readonly component = $(`app-petals-bus-in-progress-view`);

  public readonly component = ImportBusPage.component;
  public readonly ip = this.component.$(`input[formControlName="ip"]`);
  public readonly port = this.component.$(`input[formControlName="port"]`);
  public readonly username = this.component.$(
    `input[formControlName="username"]`
  );
  public readonly password = this.component.$(
    `input[formControlName="password"]`
  );
  public readonly passphrase = this.component.$(
    `input[formControlName="passphrase"]`
  );

  public readonly discardButton = this.component.$(
    `app-petals-bus-in-progress-view button.btn-discard-form`
  );
  public readonly importButton = this.component.$(
    `app-petals-bus-in-progress-view button.btn-import-form`
  );
  public readonly clearButton = this.component.$(
    `app-petals-bus-in-progress-view button.btn-clear-form`
  );
  public readonly discardName = this.discardButton.$(`span.discard-name`);
  public readonly cancelName = this.discardButton.$(`span.cancel-name`);
  public readonly importName = this.importButton.$(`span.import-name`);
  public readonly clearName = this.clearButton.$(`span.clear-name`);

  public readonly error = this.component.$(`.error-details`);
}

export class ImportBusPage extends BusInProgressFields {
  static waitAndGet() {
    browser.wait(
      urlToMatch(/\/workspaces\/\w+\/petals\/buses-in-progress$/),
      waitTimeout
    );
    browser.wait(EC.visibilityOf(ImportBusPage.component), waitTimeout);
    return new ImportBusPage();
  }

  private constructor() {
    super();
  }
}

export class BusInProgressPage extends BusInProgressFields {
  static waitAndGet() {
    browser.wait(
      urlToMatch(/\/workspaces\/\w+\/petals\/buses-in-progress\/\w+/),
      waitTimeout
    );
    browser.wait(EC.visibilityOf(BusInProgressPage.component), waitTimeout);
    return new BusInProgressPage();
  }

  private constructor() {
    super();
  }
}
