import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

@Component({
  selector: 'app-api',
  templateUrl: './api.component.html',
  styleUrls: ['./api.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApiComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
