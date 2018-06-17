import Card from '../components/card/card.component';
import OrgChartService from '../services/org-chart.service';
import Breadcrumbs from '../components/breadcrumbs/breadcrumbs.component';

export default class ContactController {
  constructor() {
  }

  createBreadcrumbs() {
    const breadcrumbs = new Breadcrumbs().getBreadCrumbs();
    return breadcrumbs;
  }

  async createContactChart() {
    let data = await OrgChartService.getData();
    let rootcart = await OrgChartService.getRootCard();
    const card = new Card(rootcart).createCard();
    const subordinates = this.searchTree(data, rootcart.id);
    let li = OrgChartService.createElement('li', [rootcart.id, 'card__li'], 'tree__root__card');
    li.appendChild(card);
    li.appendChild(subordinates);
    return li;
  }

  searchTree(data, superiorId) {
    let ul = OrgChartService.createElement('ul', ['superior'], `superior${superiorId}`);
    const subordinates = data.filter(contact => { return contact.superiorId === superiorId; });

    subordinates.forEach((subordinate) => {
      let card = new Card(subordinate).createCard();
      let classList = ['.card__content--title', '.card__content--department', '.card__content--empId']
      classList.forEach(_class => {
        let element = card.querySelector(_class);
        if (element.textContent.trim() === '') {
          element.classList.add('border-bottom');
        }
      });
      let li = OrgChartService.createElement('li', ['card__li'], subordinate.id);
      li.appendChild(card);
      li.appendChild(this.checkSubordinate(data, subordinate.id));
      ul.appendChild(li);
    });

    return ul;
  }

  checkSubordinate(data, id) {
    for (let item of data) {
      if (item.superiorId === id) { return this.searchTree(data, id); }
    }
    const ul = OrgChartService.createElement('ul', [], `superior${id}`);
    return ul;
  }
}
