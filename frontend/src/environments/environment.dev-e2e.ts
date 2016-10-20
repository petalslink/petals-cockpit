// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  mock: true,
  urlBackend: '/api',
  urlBackendSse: '/sse',
  debug: true,
  // auto log user or not
  // useful for dev env to avoid being redirected to /login every time the page is reloaded
  alreadyConnected: false,
  // delay for each http request (used if mock is set to true)
  httpDelay: 0,
  // delay for sse events
  sseDelay: 0
};
