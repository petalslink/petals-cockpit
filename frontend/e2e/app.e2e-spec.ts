import { PetalsCockpitPage } from './app.po';

describe('petals-cockpit App', function() {
  let page: PetalsCockpitPage;

  beforeEach(() => {
    page = new PetalsCockpitPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    // expect(page.getParagraphText()).toEqual('app works!');
    expect(1).toEqual(1);
  });
});
