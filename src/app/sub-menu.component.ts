import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { HierarchicalMenuItem } from '@tmdjr/ngx-navigational-list';
import { MenuDeviconComponent } from './devicon.component';

@Component({
  selector: 'ngx-sub-menu',
  imports: [
    RouterModule,
    MatButtonModule,
    MatIcon,
    MenuDeviconComponent,
  ],
  template: `
    <div
      class="backdrop"
      [class.visible]="isOpen()"
      (click)="close.emit()"
    ></div>
    <div class="sub-menu-panel" [class.open]="isOpen()">
      <div class="sub-menu-header">
        <button
          mat-icon-button
          (click)="close.emit()"
          aria-label="Close submenu"
        >
          <mat-icon>arrow_back</mat-icon>
        </button>
        @if (parentMenuItem(); as parent) {
        <ngx-menu-devicon
          [icon]="parent.navSvgPath"
          [large]="true"
        ></ngx-menu-devicon>
        <span class="parent-title">{{ parent.menuItemText }}</span>
        }
      </div>
      <nav class="sub-menu-list">
        @for (child of children(); track $index) {
        <a
          class="sub-menu-item"
          [routerLink]="['/', child.routeUrl]"
          (click)="close.emit()"
        >
          <ngx-menu-devicon
            [icon]="child.navSvgPath"
            [large]="false"
          ></ngx-menu-devicon>
          <span class="sub-menu-text">{{ child.menuItemText }}</span>
        </a>
        }
      </nav>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .backdrop {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.32);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        opacity: 0;
        visibility: hidden;
        transition: opacity 200ms ease-in-out,
          visibility 200ms ease-in-out;

        &.visible {
          opacity: 1;
          visibility: visible;
        }
      }

      .sub-menu-panel {
        position: fixed;
        top: 0;
        left: var(--nav-width, 110px);
        block-size: 100dvh;
        inline-size: 280px;
        background-color: var(--mat-sys-surface-container);
        color: var(--mat-sys-on-surface);
        box-shadow: var(--mat-sys-level3);
        transform: translateX(-100%);
        opacity: 0;
        visibility: hidden;
        transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1),
          opacity 250ms cubic-bezier(0.4, 0, 0.2, 1),
          visibility 250ms cubic-bezier(0.4, 0, 0.2, 1);
        overflow-y: auto;

        &.open {
          transform: translateX(0);
          opacity: 1;
          visibility: visible;
        }
      }

      .sub-menu-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        border-bottom: 1px solid var(--mat-sys-outline-variant);

        .parent-title {
          font-size: 1.125rem;
          font-weight: 500;
        }
      }

      .sub-menu-list {
        display: flex;
        flex-direction: column;
        padding: 0.5rem 0;
      }

      .sub-menu-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.875rem 1rem;
        text-decoration: none;
        color: inherit;
        cursor: pointer;
        transition: background-color 150ms ease-in-out;

        &:hover {
          background-color: var(--mat-sys-primary-container);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubMenuComponent {
  parentMenuItem = input<HierarchicalMenuItem | null>(null);
  isOpen = input(false);
  close = output<void>();

  children = computed(() => this.parentMenuItem()?.children ?? []);
}
