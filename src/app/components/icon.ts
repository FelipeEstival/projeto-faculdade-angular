import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-icon',
  template: `<svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.65"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path [attr.d]="paths[name] || paths['grid']" />
  </svg>`,
  styles: `
    :host {
      display: inline-flex;
      vertical-align: middle;
      flex-shrink: 0;
    }
  `,
})
export class Icon {
  @Input() name = 'grid';
  readonly paths: Record<string, string> = {
    grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    tasks: 'M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h4',
    calendar: 'M4 5h16v16H4z M8 3v4 M16 3v4 M4 11h16 M8 15h2',
    search: 'M21 21l-5-5 M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16',
    plus: 'M12 5v14 M5 12h14',
    filter: 'M4 7h16 M7 12h10 M10 17h4',
    arrow: 'M7 17V4 M3 8l4-4 4 4 M17 7v13 M13 16l4 4 4-4',
    more: 'M5 12h.01 M12 12h.01 M19 12h.01',
    check: 'M5 12l4 4L19 6',
  };
}
