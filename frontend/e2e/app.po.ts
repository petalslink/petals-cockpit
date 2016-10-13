import { browser, element, by } from 'protractor';

export class PetalsCockpitPage {
  navigateTo(url: string = '/') {
    return browser.get(url);
  }

  getText(cssSelector: string) {
    return element(by.css(cssSelector)).getText();
  }

  click(cssSelector: string) {
    element(by.css(cssSelector)).click();
  }

  fillInput(cssSelector: string, text: string) {
    element(by.css(cssSelector)).clear();
    element(by.css(cssSelector)).sendKeys(text);
  }
}
