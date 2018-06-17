import CardTemplate from './card.component.html';
import OrgChartService from '../../services/org-chart.service';

export default class Card {
  constructor(contact) {
    this.contact = contact;
  }

  createCard() {
    const images = OrgChartService.getLocalStorage('images');
    const rootCard = OrgChartService.getLocalStorage('root-card');
    let card = OrgChartService.getTemplate(CardTemplate, 'card-template');
    let a = card.querySelector('.card');
    a.id = `card${this.contact.id}`;
    
    OrgChartService.addOneClickAndDoubleClickEvent(a);

    if (this.contact.id !== rootCard.id) {
      a.setAttribute('draggable', 'true');
      a.ondragstart = (event) => { OrgChartService.drag(event); };
      a.ondrop = (event) => { OrgChartService.drop(event); };
      a.ondragover = (event) => { OrgChartService.allowDrop(event); };
      a.ondragleave = (event) => { OrgChartService.onDragLeave(event); }
    } else {
      a.ondrop = (event) => { OrgChartService.drop(event); };
      a.ondragover = (event) => { OrgChartService.allowDrop(event); };
      a.ondragleave = (event) => { OrgChartService.onDragLeave(event); }
    }

    let avatar = card.querySelector("img[alt='avatar']");
    if (images[this.contact.avatar]) {
      avatar.setAttribute('src', images[this.contact.avatar]);
    } else {
      avatar.setAttribute('src', `images/${this.contact.avatar}`);
    }

    let cardTitle = card.querySelector('.card-title');
    cardTitle.textContent = this.contact.title;

    let cardId = card.querySelector('.card-id');
    cardId.textContent = this.contact.id;

    let cardContentTitle = card.querySelector('.card__content--title');
    cardContentTitle.textContent = this.contact.firstName + ' ' + this.contact.lastName;

    let cardContentDepartment = card.querySelector('.card__content--department');
    cardContentDepartment.textContent = this.contact.department;

    let cardContentEmpId = card.querySelector('.card__content--empId');
    cardContentEmpId.textContent = this.contact.employeeId;

    // Edit Card
    let cardEdit = card.querySelector('.card__edit');
    cardEdit.onclick = (event) => { OrgChartService.editCard(event, `card${this.contact.id}`); };

    // Add Peer Card
    if (this.contact.id !== rootCard.id) {
      let addPeerCard = card.querySelector('.card__add-peer');
      addPeerCard.onclick = (event) => { OrgChartService.addBlankCard(event, a.parentNode.parentNode, this.contact.superiorId, 'peer'); };
    } else {
      let addPeerCard = card.querySelector('.card__add-peer');
      addPeerCard.parentNode.removeChild(addPeerCard);
    }

    // Add Subordinate Card
    let addSubordinateCard = card.querySelector('.card__add-subordinate');
    addSubordinateCard.onclick = (event) => { OrgChartService.addBlankCard(event, a.nextElementSibling, this.contact.id, 'subordinate'); };

    // Delete Card
    if (this.contact.id !== rootCard.id) {
      let deleteCard = card.querySelector('.card__delete');
      deleteCard.onclick = (event) => { OrgChartService.deleteCard(event, a.parentNode); };
    } else {
      let deleteCard = card.querySelector('.card__delete');
      deleteCard.parentNode.removeChild(deleteCard);
    }

    // collapse all subordinate card
    let cardCollapse = card.querySelector('.card__collapse');
    cardCollapse.childNodes[1].onclick = (event) => { OrgChartService.cardCollapse(event, `superior${this.contact.id}`, cardCollapse); };

    return card;
  }
}
