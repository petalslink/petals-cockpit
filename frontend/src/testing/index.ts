import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

// See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
/** Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler */
export const ButtonClickEvents = {
  left: { button: 0 },
  right: { button: 2 },
};

/** Simulate element click. Defaults to mouse left-button click event. */
export function click(
  el: DebugElement | HTMLElement,
  eventObj: any = ButtonClickEvents.left
): void {
  if (el instanceof HTMLElement) {
    el.click();
  } else {
    el.triggerEventHandler('click', eventObj);
  }
}

export function elementText(n: any): string {
  if (n instanceof Array) {
    return n.map(elementText).join('');
  }

  if (n.nodeType === Node.COMMENT_NODE) {
    return '';
  }

  if (n.nodeType === Node.ELEMENT_NODE && n.hasChildNodes()) {
    return elementText(Array.prototype.slice.call(n.childNodes));
  }

  if (n.nativeElement) {
    n = n.nativeElement;
  }

  return n.textContent.trim();
}

export function getElementBySelector<T = HTMLElement>(
  fixture: ComponentFixture<any>,
  selectorCss: string
): T {
  const el = fixture.debugElement.query(By.css(selectorCss));

  if (el) {
    return el.nativeElement;
  }

  return null;
}

export function getElementsBySelector<T = any>(
  fixture: ComponentFixture<any>,
  selectorCss: string
): T[] {
  const elems = fixture.debugElement.queryAll(By.css(selectorCss));

  if (elems) {
    return elems.map(elem => elem.nativeElement);
  }

  return null;
}

export function getInputListBySelector(
  fixture: ComponentFixture<any>,
  listName: string
): HTMLInputElement[] {
  return getElementsBySelector(fixture, `${listName} input`);
}

export function getInputByName(
  fixture: ComponentFixture<any>,
  name: string
): HTMLInputElement {
  return getElementBySelector(
    fixture,
    `input[formControlName="${name}"],input[name="${name}"]`
  );
}

export function getButtonByClass(
  fixture: ComponentFixture<any>,
  className: string
): HTMLButtonElement {
  return getElementBySelector(fixture, `button.${className}`);
}

export function setInputValue(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input'));
}
