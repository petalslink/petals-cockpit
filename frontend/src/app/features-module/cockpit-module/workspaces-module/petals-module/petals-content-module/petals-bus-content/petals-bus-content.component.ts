// angular modules
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

// rxjs
import { Subscription, Observable } from 'rxjs/Rx';

// ngrx
import { Store } from '@ngrx/store';

// our interfaces
import { IBus } from '../../../../../../shared-module/interfaces/petals.interface';
import { IStore } from '../../../../../../shared-module/interfaces/store.interface';
import { IWorkspace, IWorkspaceRecord } from '../../../../../../shared-module/interfaces/workspace.interface';

@Component({
  selector: 'app-petals-bus-content',
  templateUrl: './petals-bus-content.component.html',
  styleUrls: ['./petals-bus-content.component.scss']
})
export class PetalsBusContentComponent implements OnInit, OnDestroy {
  private workspace$: Observable<IWorkspaceRecord>;

  private workspace$WithBus: Observable<IWorkspaceRecord>;
  private workspace$WithBusSub: Subscription;

  private workspace: IWorkspace;
  private workspaceSub: Subscription;

  private routeSub: Subscription;

  private bus: IBus;
  private busInImport: boolean;

  constructor(private store$: Store<IStore>, private route: ActivatedRoute) {
    this.workspace$ = store$.select('workspace');

    this.workspaceSub = this.workspace$
        .map((workspaceR: IWorkspaceRecord) => workspaceR.toJS())
        .subscribe((workspace: IWorkspace) => this.workspace = workspace);
  }

  ngOnDestroy() {
    this.workspaceSub.unsubscribe();
    this.routeSub.unsubscribe();
    this.workspace$WithBusSub.unsubscribe();
  }

  ngOnInit() {
    // get the current workspace (once) only if
    // it has an array of buses with at least one value
    this.workspace$WithBus = this.workspace$
      .filter((workspaceR: IWorkspaceRecord) => workspaceR.get('buses').size > 0);

    // update the current bus IF
    // it's ID is in the URL AND the current workspace has at least one bus
    this.routeSub =
      this.route.params.combineLatest(this.workspace$WithBus.take(1),
        (params: Params) => {
          this.updateBus(params['idBus'], true);
        }).subscribe();

    this.workspace$WithBusSub =
      this.route.params.combineLatest(this.workspace$WithBus,
        (params: Params) => {
          this.updateBus(params['idBus'], false);
        }
      ).subscribe();
  }

  updateBus(idBus: string, reloadConfig: boolean) {
    // try to find the bus in buses in progress
    let busInProgressFiltered = this.workspace.busesInProgress.filter((b: IBus) => b.id === idBus);

    // if importing bus
    if (busInProgressFiltered.length > 0) {
      this.bus = busInProgressFiltered[0];
      this.busInImport = true;
    }

    else {
      this.bus = this.workspace.buses.filter((b: IBus) => b.id === idBus)[0];
      this.busInImport = false;
    }

    // reload if asked OR if bus status change from importing to imported
    // if (reloadConfig || busInImportPreviousStatus !== this.busInImport) {
    //   console.log(FETCH_BUS_CONFIG);
    //   this.store$.dispatch({ type: FETCH_BUS_CONFIG, payload: idBus });
    // }
  }
}
