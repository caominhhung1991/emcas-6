import CardEdit from '../components/card-edit/card-edit.component';
import Card from '../components/card/card.component';
import DEPARTMENTS from '../static/data/departments';
import Contact from '../static/entity/contact';
import Breadcrumbs from '../components/breadcrumbs/breadcrumbs.component';
import Modal from '../components/modal-warning/modal.component';
import TreeNode from '../components/tree-node/tree-node.component';

const modal = new Modal();
let selectedCardId = 'none';
let image = null;

function selectCard(event, element) {
  let breadcrumbs = document.querySelector('.breadcrumbs');
  let spanSlash = createElement('span', ['breadcrumbs__slash'], null);
  spanSlash.innerHTML = '/';

  let mapContact = getLocalStorage('mapData');
  let Contacts = [];
  while (element.id !== 'tree__root') {
    if (element.classList.contains('card__li')) {
      Contacts.push(element.id !== 'tree__root__card' ? mapContact[element.id] : mapContact[element.classList[0]]);
    }
    element = element.parentNode;
  }
  let newBreadcrumbs = new Breadcrumbs().getBreadCrumbs();
  newBreadcrumbs = newBreadcrumbs.querySelector('.breadcrumbs');

  for (let index = Contacts.length - 1; index >= 0; index--) {
    let contact = Contacts[index];
    let spanSlashClone = spanSlash.cloneNode(true);
    if (index === 0) {
      let spanSelected = createElement('a', ['breadcrumbs__selected'], null);
      spanSelected.innerHTML = contact.firstName + ' ' + contact.lastName;
      spanSelected.setAttribute('href', `#card${contact.id}`);
      newBreadcrumbs.appendChild(spanSelected);
      break;
    }
    let spanSuperior = createElement('a', ['breadcrumbs__superior'], null);
    spanSuperior.innerHTML = contact.firstName + ' ' + contact.lastName;
    spanSuperior.setAttribute('href', `#card${contact.id}`);
    newBreadcrumbs.appendChild(spanSuperior);
    newBreadcrumbs.appendChild(spanSlashClone);
  }
  breadcrumbs.parentNode.replaceChild(newBreadcrumbs, breadcrumbs);
}

function createElement(tagName, classes, idName, typeEvent, handlerEvent, capture) {
  let element = document.createElement(tagName);
  classes.map(className => element.classList.add(className));
  if (idName) { element.id = idName; }
  if (typeEvent) {
    element.addEventListener(typeEvent, handlerEvent, !!capture);
  }
  return element;
}

function scrollTo(element) {
  let treeRoot = document.getElementById('tree__root');
  let x = element.offsetLeft;
  let y = element.offsetTop;
  return () => { treeRoot.scrollTo(x, y); };
}

/** Edit Card
 * - editCard - edit card
 * - readURL - change Avatar
 * - finishEditCard - auto save when click outsize selected card
 */
function editCard(event, cardId) {
  event.stopPropagation();
  getData().then(data => {
    if (selectedCardId !== 'none') { return 0; }
    let card = document.getElementById(cardId);
    let contact = findContactById(data, cardId);
    let cardEdit = new CardEdit(contact).createCard();
    card.parentNode.replaceChild(cardEdit, card);
    selectedCardId = cardId;
  })

  // onclick check click outsize selected card
  document.onclick = function (e) {
    if (selectedCardId === 'none') { return 0; }
    let element = e.target;
    while (element) {
      if (element.classList[0] === 'card') {
        if (element.id === selectedCardId) { return 0; }
      } else if (element.classList[0] === undefined) { break; }
      element = element.parentNode;
    }
    finishEditCard(selectedCardId);
  };
}

function readURL(input) {
  if (input.files && input.files[0]) {
    let avatar = input.parentNode.querySelector("img[alt='avatar']");
    let images = window.localStorage.images ? getLocalStorage('images') : {};

    let reader = new window.FileReader();
    reader.onload = (e) => {
      image = input.files[0].name;
      images[image] = e.target.result;
      avatar.setAttribute('src', images[image]);
      setLocalStorage('images', images);
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function finishEditCard(cardId) {
  getData().then(data => {
    let card = document.getElementById(cardId);
    let hoten = card.querySelector('.card__content--title--input');
    hoten = hoten.value.trim();
    let hotens = hoten.split(' ');
    if (hotens.length > 2) {
      return 0;
    }

    let department = card.querySelector('.card__content--department--select');
    let empId = card.querySelector('.card__content--empId--input');

    let contact = findContactById(data, cardId);

    contact.department = department.value;
    contact.employeeId = empId.value;
    contact.firstName = hotens[0] === undefined ? '' : hotens[0];
    contact.lastName = hotens[1] === undefined ? '' : hotens[1];
    contact.title = DEPARTMENTS[department.value];

    if (image !== null) { contact.avatar = image; console.log(contact.avatar) }

    for (let i = 0; i < data.length; i++) {
      if (data[i].id === contact.id) {
        data[i] = contact;
      }
    }

    let cardAfterEdit = new Card(contact).createCard();

    let classList = ['.card__content--title', '.card__content--department', '.card__content--empId']
    classList.forEach(_class => {
      let element = cardAfterEdit.querySelector(_class);
      if (element.textContent.trim() === '') {
        element.classList.add('border-bottom');
      }
    });
    card.parentNode.replaceChild(cardAfterEdit, card);
    setLocalStorage('data', data);
    selectedCardId = 'none';
    document.onclick = null;
  })
}
/** End Edit Card  */

/** Begin Add new card - Subordinate and Peer card */
function addBlankCard(event, superior, superiorId, kind) {
  event.stopPropagation();
  event.preventDefault();
  getData().then(data => {
    let newContact = new Contact(superiorId);
    let blankCard = new Card(newContact).createCard();

    let classList = ['.card__content--title', '.card__content--department', '.card__content--empId']
    classList.forEach(_class => {
      let element = blankCard.querySelector(_class);
      element.classList.add('border-bottom');
    })

    let treeNode = new TreeNode().getTreeNode(newContact, blankCard);
    superior.appendChild(treeNode);

    if (kind === 'subordinate') {
      superior.classList.add('superior');
    }
    data.push(newContact);
    updateData(data);
  })
}

/** End Add new card */

/** Begin delete card */
function deleteCard(event, card) {
  event.stopPropagation();
  const Yes = () => {
    getData().then(data => {
      let cards = card.querySelectorAll('.card');
      cards = Array.from(cards);
      let cardsMap = {};
      cards.map(card => {
        cardsMap[card.id] = true;
      });
      data = data.filter(c => {
        return cardsMap[`card${c.id}`] !== true;
      });
      let parent = card.parentNode;
      card.parentNode.removeChild(card);

      if (parent.childNodes.length === 0) {
        parent.classList.remove('superior');
      }
      updateData(data);
    })
  }
  const No = () => { }
  modal.getModalConfirm('Do you want delete this card?', Yes, No);
}
/** End delte card */

function cardCollapse(event, superiorId, collapse) {
  event.stopPropagation();
  let superior = document.getElementById(superiorId);
  let i = collapse.querySelector('i');
  if (superior.style.display === 'none') {
    i.classList.add('fa-minus-circle');
    i.classList.remove('fa-plus-circle');
    superior.setAttribute('style', 'display:flex');
  } else {
    i.classList.remove('fa-minus-circle');
    i.classList.add('fa-plus-circle');
    superior.setAttribute('style', 'display:none');
  }
}

function findContactById(data, id) {
  for (let contact of data) {
    if (`card${contact.id}` === id) {
      return contact;
    }
  }
  return null;
}

/** Begin drag and drop 
 * - alloDrop
 * - drag
 * - drop
 * - onDragLeave
 */
function allowDrop(event) {
  event.stopPropagation();
  event.preventDefault();
  let element = event.target;
  while (element.classList.contains('card') === false) {
    element = element.parentNode;
    if (element.classList.contains('card')) {
      element.style.backgroundColor = 'lightblue'
    }
  }
}

function drag(event) {
  // event.preventDefault();
  event.stopPropagation();
  let element = event.target;
  if (event.target.tagName === 'IMG') {
    while (element.classList.contains('card') === false) {
      element = element.parentNode;
    }
  }
  event.dataTransfer.setData('text', element.id);
}

function drop(event) {
  event.stopPropagation();
  event.preventDefault();
  getData().then(data => {
    let _dataId = event.dataTransfer.getData('text');
    let _data = document.getElementById(_dataId);
    onDragLeave(event);
    if (_data === null) { return 0; }
    let dataId = _data.parentNode.id;
    let data_ = document.getElementById(dataId);
    let parentSourceData = data_.parentNode;
    let superiorSourceId = `superior${dataId}`;
    let checkDestinationCardLi = 1;

    let destiId;
    let destinationDropId;
    let destinationDrop;
    let element = event.target;

    while (element.id !== 'tree__root') {
      if (element.classList.contains('superior')) {
        if (element.id === superiorSourceId) { return 0; }
      }

      if (element.id === dataId) { return 0; }

      if (element.classList.contains('card__li')) {
        if (checkDestinationCardLi === 1) {
          if (element.id === 'tree__root__card') {
            destinationDropId = 'superior' + element.classList[0];
            destiId = element.classList[0];
          } else {
            destinationDropId = 'superior' + element.id;
            destiId = element.id;
          }
          checkDestinationCardLi++;
        }
      }
      element = element.parentNode;
    }

    const Yes = () => {
      destinationDrop = document.getElementById(destinationDropId);
      destinationDrop.appendChild(data_);
      data.map(c => {
        if (c.id === Number(dataId)) { c.superiorId = Number(destiId); }
        return c;
      });

      if (destinationDrop.childNodes.length > 0) { destinationDrop.classList.add('superior'); }
      if (parentSourceData.childNodes.length === 0) { parentSourceData.classList.remove('superior'); }
      setLocalStorage('data', data);
    }

    const No = () => { }

    modal.getModalConfirm('Are you sure want to change superior card?', Yes, No);
  })

}

function onDragLeave(event) {
  event.preventDefault();
  event.stopPropagation();
  let element = event.target;
  while (element.classList.contains('card') === false) {
    element = element.parentNode;
    if (element.classList.contains('card') === true) {
      element.style.backgroundColor = '#F4F4F4'
    }
  }
}
/** End drag and drop */

function changeToRootCard(event, element) {
  event.stopPropagation();
  const Yes = () => {
    getData().then(data => {
      let oldRootCard = document.getElementById('tree__root__card');
      let li = element.parentNode;

      if (li.id === 'tree__root__card') { return 0; }

      let ul = document.getElementById('tree__root');

      ul.replaceChild(li, oldRootCard);
      let rootId = li.id;
      let rootA = li.childNodes[1];
      let cardMenu = rootA.querySelector('.card__menu');
      let addPeer = rootA.querySelector('.card__add-peer');
      let del = rootA.querySelector('.card__delete');
      cardMenu.removeChild(addPeer);
      cardMenu.removeChild(del);

      let rootContact = data.filter(c => {
        return Number(rootId) === c.id;
      })[0];
      rootContact.superiorId = null;
      li.id = 'tree__root__card';
      let listLi = li.querySelectorAll('.card__li');
      let mapLi = {};
      Array.from(listLi).map(li => {
        mapLi[li.id] = true;
      });
      data = data.filter(c => {
        return mapLi[c.id] === true;
      });
      data.push(rootContact);
      updateData(data);
    })
  }

  const No = () => { }

  modal.getModalConfirm('Do you want change this card to root card?', Yes, No);
}

function getTemplate(template, id) {
  let div = document.createElement('div');
  div.innerHTML = template;
  let _template = div.querySelector(`#${id}`);
  let clone = document.importNode(_template.content, true);
  return clone;
}

function updateData(data) {
  setLocalStorage('data', data);
  for (let contact of data) {
    if (contact.superiorId == null) {
      setLocalStorage('root-card', contact);
      return 0;
    }
  }
}

// get data of contacts from local storage
function getLocalStorage(name) {
  if (window.localStorage.getItem(name)) {
    return JSON.parse(window.localStorage.getItem(name));
  } else {
    return [];
  }
}

async function getRootCard() {
  let rootCard = {};
  let res = await fetch('./static/data/contacts.json');
  let data = await res.text();
  let CONTACTS = JSON.parse(data);
  if (window.localStorage.getItem('root-card')) {
    rootCard = getLocalStorage('root-card');
  } else {
    for (let contact of CONTACTS) {
      if (contact.superiorId == null) {
        rootCard = contact;
        setLocalStorage('root-card', rootCard);
        break;
      }
    }
  }
  return rootCard;
}

function prepareDataMapById(data) {
  let mapData = {};
  for (let c of data) {
    mapData[c.id] = c;
  }
  window.localStorage.mapData = JSON.stringify(mapData);
}

// set data of contacs to local storage
function setLocalStorage(name, data) {
  if (name === 'data') {
    prepareDataMapById(data);
  }
  window.localStorage.setItem(name, JSON.stringify(data));
}

async function getData() {
  if (window.localStorage.getItem('data')) {
    return getLocalStorage('data');
  } else {
    let res = await fetch('./static/data/contacts.json');
    let data = await res.text();
    data = JSON.parse(data);
    setLocalStorage('data', data);
    // console.log(JSON.parse(data))
    return data;
  }
}

function addOneClickAndDoubleClickEvent(element) {
  let clickCount = 0;
  let singleClickTimer;
  element.addEventListener('click', (event) => {
    clickCount++;
    if (clickCount === 1) {
      singleClickTimer = setTimeout(() => {
        clickCount = 0;
        selectCard(event, element);
      }, 250);
    } else if (clickCount === 2) {
      clearTimeout(singleClickTimer);
      clickCount = 0;
      changeToRootCard(event, element);
    }
  }, false);
}

export default {
  selectCard,
  createElement,
  scrollTo,
  editCard,
  readURL,
  addBlankCard,
  deleteCard,
  cardCollapse,
  allowDrop,
  drag,
  drop,
  onDragLeave,
  changeToRootCard,
  getTemplate,
  getLocalStorage,
  getData,
  getRootCard,
  setLocalStorage,
  addOneClickAndDoubleClickEvent
};
