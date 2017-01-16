import { Component, OnInit } from '@angular/core';

import { IUser } from './../../../shared/interfaces/user.interface';

@Component({
  selector: 'app-menu-user-panel',
  templateUrl: './menu-user-panel.component.html',
  styleUrls: ['./menu-user-panel.component.scss']
})
export class MenuUserPanelComponent implements OnInit {
  public user = <IUser>{
    name: 'Chuck NORRIS',
    username: 'Admin'
  };

  constructor() {
  }

  ngOnInit() {
  }
}
