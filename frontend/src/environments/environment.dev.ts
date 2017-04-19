// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  // PRODUCTION
  // angular can optimize some part of his code
  // (make more or less checks) according to an environment
  production: false,

  // should throw an Error if there is incoherencs in the store for example
  // only use for tests!
  strictCoherence: true,

  // URLBACKEND
  // your backend URL
  // you can then use it for example in a service
  // `${environment.urlBackend}/some/resource`
  urlBackend: './api',

  // HASHLOCATIONSTRATEGY
  // should the URL be
  // http://some-domain#/your/app/routes (true)
  // or
  // http://some-domain/your/app/routes (false)
  hashLocationStrategy: false,

  // DEBUG
  // wether to display debug informations or not
  // TIP : Use console debug, console warn and console error
  // console log should be used only in dev and never commited
  // this way you can find every console log very easily
  debug: true,

  // MOCK
  // should you keep mocks when building the app
  // or hit the real API
  mock: {
    // HTTPDELAY
    // when using mocked data, you can use that
    // variable with .delay to simulate a network latency
    httpDelay: 500,

    // SSEDELAY
    // when using mocked data, you can use that
    // variable with .delay to simulate a network latency
    sseDelay: 500,

    // ALREADYCONNECTED
    // define wether we should consider
    // that the user's already logged or not
    alreadyConnected: true
  }
};
