import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/** Legacy DTO fields accept a Material name, Devicon classes, or an image URL. */
@Component({
  selector: 'ngx-menu-devicon',
  host: { 'aria-hidden': 'true', '[class.large]': 'large' },
  imports: [MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (value) {
      @if (isImage) {
        <img [src]="value" alt="" />
      } @else if (isDevicon) {
        <i [class]="value"></i>
      } @else {
        <mat-icon>{{ value }}</mat-icon>
      }
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      vertical-align: middle;
      inline-size: 30px;
      block-size: 30px;
      font-size: 1.6rem;
    }
    :host.large {
      font-size: 2.125rem;
      inline-size: 2.1875rem;
      block-size: 2.1875rem;
    }
    i, mat-icon, img {
      inline-size: 100%;
      block-size: 100%;
      font-size: inherit;
    }
    i { display: inline-flex; align-items: center; justify-content: center; }
    img { object-fit: contain; }
    :host([matButtonIcon]) { margin-inline-end: 8px; }
    :host([matMenuItemIcon]) { margin-inline-end: 16px; }
  `],
})
export class MenuDeviconComponent {
  @Input() icon: string | null | undefined;
  @Input() large = false;

  get value(): string { return this.icon?.trim() ?? ''; }
  get isDevicon(): boolean {
    return /^devicon-[a-z0-9-]+(?:\s+[\w-]+)*$/i.test(this.value);
  }
  get isImage(): boolean {
    return /^(?:https?:\/\/|\/(?!\/)|\.\.?\/)/i.test(this.value)
      || /^[^\s:?#]+\.(?:svg|png|jpe?g|gif|webp|avif|ico)(?:[?#].*)?$/i.test(this.value);
  }
}
