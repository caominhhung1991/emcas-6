import BreadcrumbsTemplate from './breadcrumbs.component.html';
import OrgChartService from './../../services/org-chart.service';

export default class Breadcrumbs {
  constructor() {
    this.name = 'breadcrumbs';
  }

  getBreadCrumbs() {
    const breadcrumbs = OrgChartService.getTemplate(BreadcrumbsTemplate, 'breadcrumbs-template');
    return breadcrumbs;
  }
}
