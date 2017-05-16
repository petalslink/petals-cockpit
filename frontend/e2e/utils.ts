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

import { browser, ElementFinder, $ } from 'protractor';
import * as util from 'protractor/built/util';

export type Matcher = { [Symbol.match](string: string): RegExpMatchArray } | string;

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

export function textToMatchInElement(elementFinder: ElementFinder, matcher: Matcher): Function {
  return () => elementFinder.getText().then(text => match(text, matcher), util.falseIfMissing);
}

export function expectNothingFocused() {
  return expectFocused($('body'));
}

export function expectNotFocused(element: ElementFinder) {
  return expect(browser.switchTo().activeElement().getId()).not.toEqual(element.getId());
}

export function expectFocused(element: ElementFinder) {
  return expect(browser.switchTo().activeElement().getId()).toEqual(element.getId());
}
