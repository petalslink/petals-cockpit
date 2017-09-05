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

import { range } from 'lodash';
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

export function clearInput(input: ElementFinder) {
  input.sendKeys(Key.chord(Key.CONTROL, 'a'));
  input.sendKeys(Key.DELETE);
}

export function getMultipleElementsTexts(
  parent: ElementFinder,
  ...selectors: string[]
) {
  return Promise.all(
    selectors.map(s => (parent.$$(s).getText() as any) as Promise<string[]>)
  ).then(tss => range(tss[0].length).map((_, i) => tss.map(ts => ts[i])));
}
