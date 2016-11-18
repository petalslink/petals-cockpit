export const environment = {
  production: false,
  mock: true,
  urlBackend: '/api',
  hashLocationStrategy: true,
  debug: true,
  // auto log user or not
  // useful for dev env to avoid being redirected to /login every time the page is reloaded
  alreadyConnected: false,
  // delay for each http request (used if mock is set to true)
  httpDelay: 500,
  // delay for sse events (between 15 and 30s)
  get sseDelay(): number {
    let rand = (Math.floor(Math.random() * (1 + 30 - 15)) + 15) * 1000;
    console.debug(`sse random timer : ${rand}`);
    return rand;
  },
  sseFirstBusImportShouldFail: true
};
