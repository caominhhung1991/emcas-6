import CardEditTempalte from './card-edit.component.html';
import OrgChartService from '../../services/org-chart.service';

export default class CardEdit {
  constructor(contact) {
    this.contact = contact;
  }
  createCard() {
    const images = OrgChartService.getLocalStorage('images');
    const rootCard = OrgChartService.getLocalStorage('root-card');
    let card = OrgChartService.getTemplate(CardEditTempalte, 'card-edit-template');
    let a = card.querySelector('.card');
    a.id = `card${this.contact.id}`;

    let avatar = card.querySelector("img[alt='avatar']");
    if (images[this.contact.avatar]) {
      avatar.setAttribute('src', images[this.contact.avatar]);
    } else {
      avatar.setAttribute('src', `images/${this.contact.avatar}`);
    }
    avatar.onclick = () => { document.getElementById(`avatar-input-${this.contact.id}`).click(); };

    let avatarInput = card.querySelector('.card__avatar--input');
    avatarInput.id = `avatar-input-${this.contact.id}`;
    avatarInput.onchange = () => { OrgChartService.readURL(avatarInput); };

    let cardTitle = card.querySelector('.card-title');
    cardTitle.textContent = this.contact.title;

    let cardId = card.querySelector('.card-id');
    cardId.textContent = this.contact.id;

    let cardContentTitle = card.querySelector('.card__content--title--input');
    cardContentTitle.value = this.contact.firstName + ' ' + this.contact.lastName;

    let cardContentDepartment = card.querySelector('.card__content--department--select');
    cardContentDepartment.value = this.contact.department;

    let cardContentEmpId = card.querySelector('.card__content--empId--input');
    cardContentEmpId.value = this.contact.employeeId;

    // Add Peer Card
    if (this.contact.id === rootCard.id) {
      let addPeerCard = card.querySelector('.card__add-peer');
      addPeerCard.parentNode.removeChild(addPeerCard);
    }

    // Delete Card
    if (this.contact.id === rootCard.id) {
      let deleteCard = card.querySelector('.card__delete');
      deleteCard.parentNode.removeChild(deleteCard);
    }

    // collapse all subordinate card
    let cardCollapse = card.querySelector('.card__collapse');
    cardCollapse.childNodes[1].onclick = () => { OrgChartService.cardCollapse(window.event, `superior${this.contact.id}`, cardCollapse); };
    return card;
  }
}
