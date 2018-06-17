export default class Contact {
  constructor(superirorId) {
    this.firstName = '';
    this.lastName = '';
    this.title = '';
    this.department = '';
    this.avatar = 'avatar.png';
    this.employeeId = '';
    this.superiorId = superirorId;
    this.id = this.getId();
  }

  getId() {
    let data;
    data = JSON.parse(window.localStorage.getItem('data'));
    
    let idMax = 0;
    for (let c of data) {
      if (c.id > idMax) {
        idMax = c.id;
      }
    }
    return ++idMax;
  };
}
