import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-cockpit-module',
  templateUrl: 'cockpit-module.component.html',
  styleUrls: ['cockpit-module.component.scss']
})
export class CockpitModuleComponent implements OnInit {

  constructor(private activatedRoutes: ActivatedRoute) {
    this.activatedRoutes.params.subscribe(params => {
      console.log(params);
    });
  }

  ngOnInit() {
  }

}
