// onclick="document.getElementById('modal-warning').style.display='none'"
import ModalConfirmTemplate from './modal-confirm.component.html';
import OrgChartService from './../../services/org-chart.service';

export default class Modal {
  constructor() {

  }

  getModalConfirm(message, Yes, No) {
    let modal = document.getElementById('modal-id');
    modal.innerHTML = '';

    const modalCloned = OrgChartService.getTemplate(ModalConfirmTemplate, 'modal-confirm-template');
    let modalContent = modalCloned.querySelector('.w3-modal-content');

    let modalMessage = modalContent.querySelector('.modal__message')
    let btnCloseList = modalContent.querySelectorAll('.modal__btn-close');
    btnCloseList.forEach(btnClose => {
      btnClose.onclick = function (event) {
        No();
        modal.style.display = 'none';
      }
    });

    let btnOk = modalContent.querySelector('.modal__btn-ok');
    btnOk.onclick = function (event) {
      Yes();
      modal.style.display = 'none';
    }

    document.onkeyup = function (event) {
      if (event.keyCode === 13) {
        Yes();
        modal.style.display = 'none';
      }
      document.onkeyup = null;
    }

    modalMessage.innerHTML = message;
    
    modal.appendChild(modalContent);
    modal.style.display = 'block';
  }
}
