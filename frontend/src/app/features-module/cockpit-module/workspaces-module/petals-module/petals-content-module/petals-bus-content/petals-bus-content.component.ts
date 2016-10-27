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

// our actions
import { FETCH_BUS_CONFIG } from '../../../../../../shared-module/reducers/workspace.reducer';

@Component({
  selector: 'app-petals-bus-content',
  templateUrl: './petals-bus-content.component.html',
  styleUrls: ['./petals-bus-content.component.scss']
})
export class PetalsBusContentComponent implements OnInit, OnDestroy {
  private workspace$: Observable<IWorkspaceRecord>;

  private workspace$WithBus: Observable<IWorkspaceRecord>;
  private workspace$WithBusSubscription: Subscription;

  private workspace: IWorkspace;
  private workspaceSubscription: Subscription;

  private routeSubscription: Subscription;

  private bus: IBus;
  private busInImport: boolean;

  constructor(private store$: Store<IStore>, private route: ActivatedRoute) {
    this.workspace$ = store$.select('workspace');

    this.workspaceSubscription = this.workspace$
        .map((workspaceR: IWorkspaceRecord) => workspaceR.toJS())
        .subscribe((workspace: IWorkspace) => this.workspace = workspace);
  }

  ngOnDestroy() {
    this.workspaceSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
    this.workspace$WithBusSubscription.unsubscribe();
  }

  ngOnInit() {
    // get the current workspace (once) only if
    // it has an array of buses with at least one value
    this.workspace$WithBus = this.workspace$
      .filter((workspaceR: IWorkspaceRecord) => workspaceR.get('buses').size > 0);

    // update the current bus IF
    // it's ID is in the URL AND the current workspace has at least one bus
    this.routeSubscription =
      this.route.params.combineLatest(this.workspace$WithBus.take(1),
        (params: Params) => {
          this.updateBus(params['idBus'], true);
        }).subscribe();

    this.workspace$WithBusSubscription =
      this.route.params.combineLatest(this.workspace$WithBus,
        (params: Params) => {
          this.updateBus(params['idBus'], false);
        }).subscribe();
  }

  updateBus(idBus: string, reloadConfig: boolean) {
    // try to find the bus in buses in progress
    let busInProgressFiltered = this.workspace.busesInProgress.filter((b: IBus) => b.id === idBus);

    let busInImportPreviousStatus = this.busInImport;

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
    if (reloadConfig || busInImportPreviousStatus !== this.busInImport) {
      this.store$.dispatch({type: FETCH_BUS_CONFIG, payload: idBus});
    }
  }
}
