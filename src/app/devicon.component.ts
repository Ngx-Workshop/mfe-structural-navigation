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
  imports: [IsDeviconPipe, MatIcon],
  template: `
    @if (icon | isDevicon) {
    <i [class]="icon"></i>
    } @else {
    <mat-icon>{{ icon }}</mat-icon>
    }
  `,
  styles: [
    `
      i,
      mat-icon {
        font-size: 2.5rem;
        inline-size: 40px;
        block-size: 40px;
        vertical-align: middle;
      }
    `,
  ],
})
export class MenuDeviconComponent {
  @Input() icon: string | null | undefined;
}
