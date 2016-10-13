import { PetalsCockpitPage } from './app.po';
import { browser } from 'protractor';

describe('petals-cockpit App', function() {
  let p: PetalsCockpitPage;

  beforeEach(() => {
    p = new PetalsCockpitPage();
  });

  it('should be redirected to login if a user is trying to access a protected route without being logged', () => {
    p.navigateTo('/cockpit');

    expect(browser.getCurrentUrl()).toMatch('/login');
  });

  it('should not login if user/pwd not match', () => {
    p.navigateTo('/login');

    expect(p.getText('.page-login button')).toMatch('Log in');

    p.fillInput('md-input input[name="username"]', 'admin');
    p.fillInput('md-input input[name="password"]', 'randomPasswordNotWorking');

    p.click('.page-login button');

    expect(browser.getCurrentUrl()).toMatch('/login');
  });

  it('should login if user/pwd match', () => {
    p.navigateTo('/login');

    p.fillInput('md-input input[name="username"]', 'admin');
    p.fillInput('md-input input[name="password"]', 'admin');

    p.click('.page-login button');

    expect(browser.getCurrentUrl()).toMatch('/cockpit/workspaces');
  });
});
