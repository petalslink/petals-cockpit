import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

@Component({
  selector: 'app-petals',
  templateUrl: './petals.component.html',
  styleUrls: ['./petals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PetalsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
