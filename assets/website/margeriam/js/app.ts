import '../css/app.scss';
import lozad from 'lozad';

const el = document.querySelectorAll('img');
const observer = lozad(el);
observer.observe();
