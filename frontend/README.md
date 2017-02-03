# PetalsCockpit - Frontend

This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.0.0-beta.30.

## Package management

Package management is done with yarn, simply call `yarn --pure-lockfile` to populate the `node_modules` directory exactly as it was in the latest commit.

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Deploying to Github Pages

Run `ng github-pages:deploy` to deploy to Github Pages.

## Further help

To get more help on the `angular-cli` use `ng help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Dev comments

- Auxiliary routes are not working within lazy loaded modules
  See https://github.com/angular/angular/issues/13807#issuecomment-270880382
  When it work, it would be nice to have a separated URL for the left menu (this way we could be lazy loading menu components too)

- Layout are bugged when using fxLayoutGap https://github.com/angular/flex-layout/issues/106 (should be merged in master soon)

- Can't have md-tab working well with router : https://github.com/angular/material2/issues/524 (should be released soon)

- AOT is not working because of : https://github.com/angular/angular/issues/14005 (see also https://github.com/angular/angular/issues/13909)

- Due to error in build we have that in package.json
    "build-electron": "ng build --prod -bh='./'; node ./electron/generate-package-json.js; cp ./electron/electron.js dist/",
    "electron": "npm run build-electron; electron dist/"
When everything is stable, replace it by
    "build-electron": "ng build --prod --aot --no-sourcemap -bh='./' && node ./electron/generate-package-json.js && cp ./electron/electron.js dist/",
    "electron": "npm run build-electron && electron dist/"

- Material design popup do not work with lazy loaded routes and the whole app is broken
Temp fix : Setup material2-builds while waiting for the new release :
"@angular/material": "https://github.com/angular/material2-builds.git"
Once solved, restore the original @angular/material
