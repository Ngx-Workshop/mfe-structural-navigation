import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  Input,
  signal,
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
import { SubMenuComponent } from './sub-menu.component';

type UserRole = 'admin' | 'publisher' | 'regular' | 'none';

@Component({
  selector: 'ngx-navigation-mfe',
  imports: [
    AsyncPipe,
    MatIcon,
    MatButtonModule,
    RouterModule,
    NgxThemePicker,
    MenuDeviconComponent,
    SubMenuComponent,
  ],
  template: `
    @if(viewModel$ | async; as vm) { @if(vm.mode != 'disabled') {
    <ngx-sub-menu
      [parentMenuItem]="activeParentMenuItem()"
      [isOpen]="isSubMenuOpen()"
      (close)="closeSubmenu()"
    />
    <nav class="navbar-header">
      <a
        class="menu-item ngx-workshop-logo"
        [routerLink]="'/'"
        (click)="closeSubmenu()"
      >
        <mat-icon>tips_and_updates</mat-icon>
        <p>Ngx-Workshop</p>
      </a>
      @for(menuItem of vm.menuItems; track $index) {
      @if(menuItem.children && menuItem.children.length > 0) {
      <a class="menu-item" (click)="openSubmenu(menuItem)">
        <ngx-menu-devicon
          [icon]="menuItem.navSvgPath"
          [large]="true"
        ></ngx-menu-devicon>
        <p>{{ menuItem.menuItemText }}</p>
      </a>
      } @else {
      <a
        class="menu-item"
        [routerLink]="['/', menuItem.routeUrl]"
        (click)="closeSubmenu()"
      >
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
        class="sign-in-cta"
        mat-flat-button
        (click)="redirectToLogin()"
        >Sign In</a
      >
      }
    </nav>
    } }
  `,
  styles: [
    `
      :host {
        --nav-width: 110px;
        display: block;
        inline-size: var(--nav-width);
        block-size: 100dvh;
        position: relative;
        .navbar-header {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          color: var(--mat-sys-on-primary-container);
          background-color: var(--mat-sys-primary-container);
          block-size: 100%;
        }
        .ngx-workshop-logo {
          font-weight: 300;
          font-size: 0.9rem;
          mat-icon {
            font-size: 3.18rem;
            inline-size: 50px;
            block-size: 50px;
            vertical-align: middle;
          }
        }
        .menu-item {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-block: 1.25rem;
          text-decoration: none;
          color: inherit;
        }
        .sign-in-cta {
          margin-bottom: 1rem;
        }
      }
      ::ng-deep ngx-theme-picker {
        mat-icon {
          color: var(--mat-sys-on-primary-container);
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

  // Submenu state using signals
  isSubMenuOpen = signal(false);
  activeParentMenuItem = signal<HierarchicalMenuItem | null>(null);

  @Input()
  set mode(value: StructuralOverrideMode) {
    this.mode$.next(value);
  }
  mode$ = new BehaviorSubject<StructuralOverrideMode>('disabled');

  @Input()
  set role(value: UserRole) {
    this.role$.next(value);
  }
  role$ = new BehaviorSubject<UserRole>('none');

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
    this.activeParentMenuItem.set(menuItem);
    this.isSubMenuOpen.set(true);
  }

  closeSubmenu(): void {
    this.isSubMenuOpen.set(false);
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

export default App;
