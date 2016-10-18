export const environment = {
  production: true,
  mock: false,
  urlBackend: '/api',
  debug: false,
  // auto log user or not
  // useful for dev env to avoid being redirected to /login every time the page is reloaded
  alreadyConnected: false,
  // delay for each http request (used if mock is set to true)
  httpDelay: 0
};
