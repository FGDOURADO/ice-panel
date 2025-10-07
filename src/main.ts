import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';

// Dynamic config based on environment
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

if (isLocalhost) {
  // Local development - no base href
  import('./app/app.config.local').then(({ appConfig }) => {
    bootstrapApplication(App, appConfig)
      .catch((err) => console.error(err));
  });
} else {
  // Production - with base href
  import('./app/app.config').then(({ appConfig }) => {
    bootstrapApplication(App, appConfig)
      .catch((err) => console.error(err));
  });
}
