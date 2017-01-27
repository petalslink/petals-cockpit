import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { IUser } from './../../../shared/interfaces/user.interface';
import { IStore } from './../../../shared/interfaces/store.interface';
import { Users } from './../../../shared/state/users.reducer';

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

  constructor(private _store$: Store<IStore>) { }

  ngOnInit() {
  }

  disconnect() {
    this._store$.dispatch({ type: Users.DISCONNECT_USER });
  }
}
