# PetalsCockpit - Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

## Package management

Package management is done with yarn, simply call `yarn --pure-lockfile` to populate the `node_modules` directory exactly as it was in the latest commit.

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `yarn run test` to execute the unit tests.

## Running "end-to-end" tests

Considered end to end by frontend standards (ie: functionnal, integration)   

Run `ng e2e` to execute the end-to-end tests (against frontend mocks) via [Protractor](http://www.protractortest.org/).  

To execute end-to-end tests (against frontend mocks) via [cypress](https://www.cypress.io/)
* run `yarn cypress open` for interactive mode
* run `yarn cypress:chromium` for headless mode

## Running actual end-to-end tests

See `../e2e/README.md` to execute end-to-end tests against a real backend via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Dev comments

- Auxiliary routes are not working within lazy loaded modules
  See
  https://github.com/angular/angular/issues/13807#issuecomment-270880382
  https://github.com/angular/angular/issues/10981
  When it work, it would be nice to have a separated URL for the left menu (this way we could be lazy loading menu components too)

## Notes about the various `tsconfig.json` files

Angular-cli (configured in `.angular-cli.conf`) uses `src/tsconfig.app.json` to compile the application, `src/tsconfig.spec.json` to compile the tests and `e2e/tsconfig.e2e.json` to compile the e2e tests.

The IDE will most certainly uses `src/tsconfig.json` for the files in `src/` and `src/tsconfig.json` for the files in `e2e/`.
