import ContactController from './controllers/ContactController';
import './static/sass/main.scss';

const contactController = new ContactController();

const treeRoot = document.getElementById('tree__root');

contactController.createContactChart().then(orgChart => {
  treeRoot.appendChild(orgChart);
});

const header = document.querySelector('header');
header.appendChild(contactController.createBreadcrumbs());
