import {
  ConnectedPosition,
  OverlayModule,
} from '@angular/cdk/overlay';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import type { StructuralOverrideMode } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import {
  HierarchicalMenuItem,
  NgxNavigationalListService,
  StructuralSubtype,
} from '@tmdjr/ngx-navigational-list';
import { NgxThemePicker } from '@tmdjr/ngx-theme-picker';
import {
  BehaviorSubject,
  combineLatest,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { MenuDeviconComponent } from './devicon.component';
import { SubMenuListComponent } from './sub-menu-list.component';

@Component({
  selector: 'ngx-navigation-mfe',
  imports: [
    AsyncPipe,
    OverlayModule,
    MatIcon,
    MatButtonModule,
    RouterModule,
    NgxThemePicker,
    SubMenuListComponent,
    MenuDeviconComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  template: `
    @if(viewModel$ | async; as vm) { @if(vm.mode != 'disabled') {
    <nav
      class="navbar-header"
      cdkOverlayOrigin
      #submenuOrigin="cdkOverlayOrigin"
    >
      <a [routerLink]="'/'" class="menu-item workshop-logo">
        <mat-icon>tips_and_updates</mat-icon>
        <p>Ngx-Workshop</p>
      </a>
      @for(menuItem of vm.menuItems; track $index) {
      @if(menuItem.children && menuItem.children.length > 0) {
      <a
        class="menu-item"
        (click)="openSubmenu(menuItem)"
        [attr.aria-expanded]="activeParent?._id === menuItem._id"
      >
        <ngx-menu-devicon
          [icon]="menuItem.navSvgPath"
          [large]="true"
        ></ngx-menu-devicon>
        <p>{{ menuItem.menuItemText }}</p>
      </a>
      } @else {
      <a class="menu-item" [routerLink]="['/', menuItem.routeUrl]">
        <ngx-menu-devicon
          [icon]="menuItem.navSvgPath"
          [large]="true"
        ></ngx-menu-devicon>
        <p>{{ menuItem.menuItemText }}</p>
      </a>
      } }

      <div class="flex-spacer"></div>
      <ngx-theme-picker class="menu-item"></ngx-theme-picker>
      @if(vm.role === 'none') {
      <a
        class="menu-item sign-in-cta"
        mat-flat-button
        (click)="redirectToLogin()"
        >Sign In</a
      >
      }
    </nav>

    <ng-template
      cdk-connected-overlay
      [cdkConnectedOverlayOrigin]="submenuOrigin"
      [cdkConnectedOverlayOpen]="!!activeParent"
      [cdkConnectedOverlayHasBackdrop]="true"
      [cdkConnectedOverlayPositions]="overlayPositions"
      cdkConnectedOverlayPanelClass="submenu-overlay-panel"
      [cdkConnectedOverlayBackdropClass]="'submenu-backdrop'"
      (backdropClick)="closeSubmenu()"
    >
      <ngx-sub-menu-list
        [parent]="activeParent"
        (closed)="closeSubmenu()"
        (navigated)="closeSubmenu()"
      ></ngx-sub-menu-list>
    </ng-template>
    } }
  `,
  styles: [
    `
      ngx-navigation-mfe {
        display: block;
        inline-size: 110px; /* width of the left rail column */
        block-size: 100dvh; /* fill the shell's left column */
      }

      .navbar-header {
        display: flex;
        block-size: 100%;
        flex-wrap: wrap;
        align-items: center;
        flex-direction: column;
        color: var(--mat-sys-on-primary-container);
        background-color: var(--mat-sys-primary-container);
        .menu-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-block: 1.25rem;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          transition: fill 0.3s ease;
          &.navbar-menu-item-selected {
            color: var(--mat-sys-primary-container);
            background-color: var(--mat-sys-on-primary-container);
          }
          mat-icon {
            color: var(--mat-sys-on-primary-container);
          }
        }
      }
      .workshop-logo {
        font-weight: 300;
        font-size: 0.9rem;
        mat-icon {
          font-size: 3.18rem;
          inline-size: 50px;
          block-size: 50px;
          vertical-align: middle;
          margin-left: 10px;
        }
      }
      .sign-in-cta {
        margin-bottom: 1rem;
      }
      .submenu-backdrop {
        left: 110px !important;
        inline-size: calc(100vw - 110px);
        background: rgba(0, 0, 0, 0.32);
      }
      .submenu-overlay-panel {
        display: block;
        animation: submenu-enter 230ms
          cubic-bezier(0.25, 0.8, 0.25, 1);
        transform-origin: left center;
        will-change: transform, opacity;
      }
      @keyframes submenu-enter {
        from {
          opacity: 0;
          transform: translateX(-20%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .submenu-overlay-panel {
          animation: none;
          transform: none;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly subtype: StructuralSubtype = 'NAV';
  private readonly doc = inject(DOCUMENT);
  private readonly ngxNavigationalListService = inject(
    NgxNavigationalListService
  );

  @Input()
  set mode(value: StructuralOverrideMode) {
    this.mode$.next(value);
  }
  mode$ = new BehaviorSubject<StructuralOverrideMode>('disabled');

  @Input()
  set role(value: 'admin' | 'publisher' | 'regular' | 'none') {
    this.role$.next(value);
  }
  role$ = new BehaviorSubject<
    'admin' | 'publisher' | 'regular' | 'none'
  >('none');

  activeParent: HierarchicalMenuItem | null = null;
  readonly overlayPositions: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
    },
  ];

  viewModel$ = combineLatest([this.mode$, this.role$]).pipe(
    tap(([, role]) =>
      this.ngxNavigationalListService.setRoleState(role)
    ),
    switchMap(([mode, role]) =>
      combineLatest({
        mode: of(mode),
        role: of(role),
        menuItems:
          this.ngxNavigationalListService.getFilteredNavigationBySubtypeAndState(
            this.subtype,
            mode.toUpperCase()
          ),
      })
    )
  );

  openSubmenu(menuItem: HierarchicalMenuItem): void {
    this.activeParent =
      this.activeParent?._id === menuItem._id ? null : menuItem;
  }

  closeSubmenu(): void {
    this.activeParent = null;
  }

  redirectToLogin(): void {
    const href = this.doc?.defaultView?.location?.href ?? '/';
    const redirect = encodeURIComponent(href);
    const baseRedirectUrl = 'https://auth.ngx-workshop.io';
    const loginUrl = baseRedirectUrl.includes('?')
      ? `${baseRedirectUrl}&redirect=${redirect}`
      : `${baseRedirectUrl}?redirect=${redirect}`;
    this.doc.defaultView?.location?.assign(loginUrl);
  }
}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
