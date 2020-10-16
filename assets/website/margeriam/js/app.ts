import '../css/app.scss';
import lozad from 'lozad';
import { init } from '@sentry/browser';
import { Integrations } from "@sentry/tracing";

document.addEventListener("DOMContentLoaded", function() {
  const body = document.querySelector('body') as HTMLBodyElement;
  const dsn = body.getAttribute('data-sentry');
  if (dsn) {
    init({
      dsn,
      integrations: [
        new Integrations.BrowserTracing(),
      ],
      tracesSampleRate: 1.0,
    });
  }
});

const el = document.querySelectorAll('img');
const observer = lozad(el);
observer.observe();
