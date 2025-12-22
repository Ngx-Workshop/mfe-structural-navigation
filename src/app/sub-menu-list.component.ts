import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import type { HierarchicalMenuItem } from '@tmdjr/ngx-navigational-list';
import { MenuDeviconComponent } from './devicon.component';

@Component({
  selector: 'ngx-sub-menu-list',
  standalone: true,
  imports: [
    MatIcon,
    RouterModule,
    CdkTrapFocus,
    MenuDeviconComponent,
  ],
  template: `
    @if (parent) {
    <section class="submenu-panel" cdkTrapFocus>
      <header class="submenu-header">
        <div class="submenu-title">
          <ngx-menu-devicon
            [icon]="parent.navSvgPath"
          ></ngx-menu-devicon>
          <span class="submenu-parent-label">{{
            parent.menuItemText
          }}</span>
        </div>
        <button
          type="button"
          class="icon-button"
          aria-label="Close submenu"
          (click)="closed.emit()"
        >
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <ul class="submenu-items" role="menu">
        @for (child of parent.children; track child._id) {
        <li role="none">
          <a
            role="menuitem"
            class="submenu-link"
            [routerLink]="['/', child.routeUrl]"
            (click)="onNavigate()"
          >
            <ngx-menu-devicon
              [icon]="child.navSvgPath"
            ></ngx-menu-devicon>
            <span>{{ child.menuItemText }}</span>
          </a>
        </li>
        }
      </ul>
    </section>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        inline-size: 320px;
        max-inline-size: 360px;
        block-size: 100dvh;
        background: var(--mat-sys-surface);
        color: var(--mat-sys-on-surface);
      }

      .submenu-panel {
        inline-size: 100%;
        block-size: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .submenu-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
        border-block-end: 1px solid rgba(0, 0, 0, 0.08);
      }

      .submenu-title {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }

      .submenu-parent-label {
        font-size: 1.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .icon-button {
        background: transparent;
        border: none;
        cursor: pointer;
        color: inherit;
        inline-size: 36px;
        block-size: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 120ms ease;
      }

      .icon-button:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }

      .submenu-items {
        list-style: none;
        margin: 0;
        padding: 0.25rem 0;
        overflow-y: auto;
        flex: 1 1 auto;
      }

      .submenu-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.875rem 1.25rem;
        color: inherit;
        text-decoration: none;
        border-radius: 0.5rem;
        margin: 0.125rem 0.75rem;
        transition: background-color 140ms ease, color 140ms ease;
      }

      .submenu-link:hover,
      .submenu-link:focus-visible {
        background: var(--mat-sys-primary-container);
        color: var(--mat-sys-on-primary-container);
        outline: none;
      }

      mat-icon {
        font-size: 1.25rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubMenuListComponent {
  @Input() parent: HierarchicalMenuItem | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() navigated = new EventEmitter<void>();

  onNavigate(): void {
    this.navigated.emit();
  }
}
