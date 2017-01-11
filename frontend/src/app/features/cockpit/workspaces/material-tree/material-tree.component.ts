import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

interface TreeEvent {
  deepLevel: number;
  index: number;
  item: any;
}

@Component({
  selector: 'app-material-tree',
  templateUrl: './material-tree.component.html',
  styleUrls: ['./material-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaterialViewComponent implements OnInit {
  // pass the tree to display
  @Input() tree;
  // pass a margin to apply on each level (in px)
  @Input() marginLeft = 0;
  // only used internally
  @Input() deepLevel? = 0;
  // event when the user select a line
  @Output() onSelect = new EventEmitter();
  // event when the user toggle a line
  @Output() onToggleFold = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  get margin() {
    return this.deepLevel === 0 ? 0 : this.marginLeft;
  }

  select(treeEvent: TreeEvent) {
    this.onSelect.emit(treeEvent);
  }

  toggleFold(treeEvent: TreeEvent, event: MouseEvent) {
    this.onToggleFold.emit(treeEvent);

    if (typeof event !== 'undefined') {
      event.stopPropagation();
    }
  }
}
