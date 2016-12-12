export const environment = {
  production: true,
  mock: true,
  urlBackend: '/api',
  hashLocationStrategy: true,
  debug: true,
  // auto log user or not
  // useful for dev env to avoid being redirected to /login every time the page is reloaded
  alreadyConnected: false,
  // delay for each http request (used if mock is set to true)
  httpDelay: 1000,
  // delay for sse events (between 10 and 15s)
  get sseDelay(): number {
    let rand = (Math.floor(Math.random() * (1 + 15 - 10)) + 10) * 1000;
    console.debug(`sse random timer : ${rand}`);
    return rand;
  },
  sseFirstBusImportShouldFail: true
};
