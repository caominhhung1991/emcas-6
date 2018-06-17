import OrgChartService from './../../services/org-chart.service';

export default class TreeNode {
  constructor() {
  }

  getTreeNode(contact, card) {
    let ul = OrgChartService.createElement('ul', [], `superior${contact.id}`);
    let li = OrgChartService.createElement('li', ['card__li'], contact.id);
    li.appendChild(card);
    li.appendChild(ul);
    return li;
  }
}