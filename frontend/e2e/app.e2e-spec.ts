import { PetalsCockpitPage } from './app.po';

describe('petals-cockpit App', function() {
  let page: PetalsCockpitPage;

  beforeEach(() => {
    page = new PetalsCockpitPage();
  });

  it('should display message saying workspaces works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Workspaces works');
  });
});
