import './polyfills.ts';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment';
import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();
}

export function bootstrapApp() {
  platformBrowserDynamic().bootstrapModule(AppModule);
}

// some lags are noticed at startup if no delay
setTimeout(bootstrapApp, 100);
