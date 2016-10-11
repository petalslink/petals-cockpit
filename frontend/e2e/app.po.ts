import { browser, element, by } from 'protractor';

export class PetalsCockpitPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('md-card-title')).getText();
  }
}
