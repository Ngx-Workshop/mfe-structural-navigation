import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Pipe({ name: 'isDevicon', standalone: true, pure: true })
export class IsDeviconPipe implements PipeTransform {
  transform(value: string | null | undefined): boolean {
    return !!value?.startsWith('devicon-');
  }
}

@Component({
  selector: 'ngx-menu-devicon',
  host: { 'aria-hidden': 'true' },
  imports: [IsDeviconPipe, MatIcon],
  template: `
    @if (icon | isDevicon) {
      <i [class]="icon" [class.large]="large"></i>
    } @else {
      <mat-icon [class.large]="large">{{ icon }}</mat-icon>
    }
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        i,
        mat-icon {
          font-size: 1.6rem;
          inline-size: 30px;
          block-size: 30px;
          vertical-align: middle;

          &.large {
            font-size: 2.125rem;
            inline-size: 2.1875rem;
            block-size: 2.1875rem;
          }
        }
      }
    `,
  ],
})
export class MenuDeviconComponent {
  @Input() icon: string | null | undefined;
  @Input() large: boolean = false;
}
