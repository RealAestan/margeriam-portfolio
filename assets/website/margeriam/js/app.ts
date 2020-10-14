import '../css/app.scss';
import lozad from 'lozad';
import { init } from '@sentry/browser';

document.addEventListener("DOMContentLoaded", function() {
  const body = document.querySelector('body') as HTMLBodyElement;
  const dsn = body.getAttribute('data-sentry');
  if (dsn) {
    init({
      dsn
    });
  }
});

const el = document.querySelectorAll('img');
const observer = lozad(el);
observer.observe();
