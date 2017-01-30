import { Component, Input, ChangeDetectionStrategy, OnChanges, AfterViewInit, AfterViewChecked } from '@angular/core';

declare const jdenticon;
declare const md5;

@Component({
  selector: 'app-generate-icon',
  templateUrl: './generate-icon.component.html',
  styleUrls: ['./generate-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenerateIconComponent implements AfterViewInit, OnChanges {
  @Input() size: number;
  @Input() text: number;

  public hashMd5: string;

  constructor() { }

  ngAfterViewInit() {
    this._updateSvg();
  }

  ngOnChanges() {
    this._updateSvg();
  }

  private _updateSvg() {
    this.hashMd5 = md5(this.text);

    // use a setInterval otherwise jdenticon's called **before**
    // the view's updated and the svg is draw with an old MD5 hash
    // AfterViewChecked is not a good solution because it's checked
    // too many times
    setInterval(() => {
      jdenticon();
    }, 500);
  }

  get wrapperSize() {
    return `${this.size + 5}`;
  }
}
