/**
 * Copyright (C) 2017-2018 Linagora
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

// tslint:disable:import-blacklist because lodash-es imports doesn't work with e2e tsconfig
import { range } from 'lodash';
import * as path from 'path';
import {
  $,
  browser,
  ElementFinder,
  ExpectedConditions as EC,
  Key,
  promise,
} from 'protractor';
import * as util from 'protractor/built/util';

import { waitTimeout } from './common';

export type Matcher =
  | { [Symbol.match](string: string): RegExpMatchArray }
  | string;

export function match(text: string, matcher: Matcher): boolean {
  if (typeof matcher === 'string') {
    return text === matcher;
  } else {
    // careful, match does not return a boolean!
    return !!text.match(matcher);
  }
}

export function urlToMatch(matcher: Matcher): Function {
  return () => browser.getCurrentUrl().then(url => match(url, matcher));
}

export function stringToMatch(
  p: () => promise.Promise<string>,
  matcher: Matcher
): Function {
  return () => p().then(text => match(text, matcher), util.falseIfMissing);
}

export function textToMatchInElement(
  elementFinder: ElementFinder,
  matcher: Matcher
): Function {
  return stringToMatch(() => elementFinder.getText(), matcher);
}

export function expectNothingFocused() {
  return expectFocused($('body'));
}

export function expectNotFocused(element: ElementFinder) {
  return expect(
    browser
      .switchTo()
      .activeElement()
      .getId()
  ).not.toEqual(element.getId());
}

export function expectFocused(element: ElementFinder) {
  return expect(
    browser
      .switchTo()
      .activeElement()
      .getId()
  ).toEqual(element.getId());
}

export function waitAndClick(el: ElementFinder) {
  browser.wait(EC.elementToBeClickable(el), waitTimeout);
  el.click();
}

export function waitAndCheck(el: ElementFinder, str: string) {
  browser.wait(EC.textToBePresentInElement(el, str), waitTimeout);
}

export function clearInput(input: ElementFinder): any {
  return input.getAttribute('value').then(v => {
    if (v === '') {
      return;
    } else if (!v) {
      throw new Error('No value attribute');
    } else {
      return input.sendKeys(Key.BACK_SPACE).then(() => clearInput(input));
    }
  });
}

export function getMultipleElementsTexts(
  parent: ElementFinder,
  ...selectors: string[]
) {
  return Promise.all(
    selectors.map(s => (parent.$$(s).getText() as any) as Promise<string[]>)
  ).then(tss => range(tss[0].length).map((_, i) => tss.map(ts => ts[i])));
}

export function selectFileInInput(
  zipPath: string,
  fileInput: ElementFinder,
  fileName: ElementFinder,
  nameInput: ElementFinder,
  expectFileNameToBe?: string,
  expectInputNameToBe?: string
) {
  const filePath = path.resolve(__dirname, zipPath);
  fileInput.sendKeys(filePath);

  if (!!expectFileNameToBe) {
    expect(fileName.getText()).toBe(expectFileNameToBe);
    expect(nameInput.getAttribute('value')).toBe(expectInputNameToBe);
  }
}
