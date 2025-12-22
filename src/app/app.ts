import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import type { StructuralOverrideMode } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import {
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

export interface Sections {
  [key: string]: Section;
}
export interface Section {
  _id: string;
  sectionTitle: string;
  menuSvgPath: string;
  headerSvgPath: string;
}

const mockSections: Sections = {
  angular: {
    _id: 'angular',
    sectionTitle: 'Angular',
    menuSvgPath: 'devicon-angular-plain',
    headerSvgPath:
      'https://res.cloudinary.com/dowdpiikk/image/upload/v1710120956/angular_nav_gradient_small_mzk3iz.gif',
  },
  nestjs: {
    _id: 'nestjs',
    sectionTitle: 'Nest JS',
    menuSvgPath: 'devicon-nestjs-original',
    headerSvgPath:
      'https://res.cloudinary.com/dowdpiikk/image/upload/v1710120956/nestjs_zlsdwn.svg',
  },
  rxjs: {
    _id: 'rxjs',
    sectionTitle: 'RxJS',
    menuSvgPath: 'devicon-rxjs-plain',
    headerSvgPath:
      'https://res.cloudinary.com/dowdpiikk/image/upload/v1710120956/rxjs_x95bjp.svg',
  },
};

@Component({
  selector: 'ngx-navigation-mfe',
  imports: [
    AsyncPipe,
    MatIcon,
    MatButtonModule,
    MatMenuModule,
    RouterModule,
    NgxThemePicker,
  ],
  template: `
    @if(viewModel$ | async; as vm) { @if(vm.mode != 'disabled') {
    <nav
      class="navbar-header mat-elevation-z6 docs-navbar-hide-small"
    >
      <a [routerLink]="'/'" class="workshop-logo docs-button">
        <mat-icon>tips_and_updates</mat-icon>
        <p>Ngx Workshop</p>
      </a>

      <!-- @for(section of sections | keyvalue; track section.key) {
      <a
        class="docs-button"
        [routerLink]="'/sidenav/workshops/' + section.key"
        routerLinkActive="navbar-menu-item-selected"
      >
        <i
          class="section-logo"
          [ngClass]="section.value.menuSvgPath"
        ></i>
        <p>{{ section.value.sectionTitle }}</p>
      </a>
      } -->
      @for(menuItem of vm.menuItems; track $index) {
      @if(menuItem.children && menuItem.children.length > 0) {
      <a
        mat-button
        [matMenuTriggerFor]="menuItemMenu$index"
        class="docs-button"
      >
        <mat-icon>{{ menuItem.headerSvgPath }}</mat-icon>
        {{ menuItem.menuItemText }}
      </a>
      <mat-menu #menuItemMenu$index="matMenu" class="dense-menu">
        @for (child of menuItem.children; track $index) {
        <button mat-menu-item [routerLink]="['/', child.routeUrl]">
          <mat-icon>{{ child.headerSvgPath }}</mat-icon>
          {{ child.menuItemText }}
        </button>
        }
      </mat-menu>
      } @else {
      <a mat-button [routerLink]="['/', menuItem.routeUrl]">
        <mat-icon>{{ menuItem.headerSvgPath }}</mat-icon>
        {{ menuItem.menuItemText }}
      </a>
      } }

      <div class="flex-spacer"></div>
      <ngx-theme-picker class="docs-button"></ngx-theme-picker>
    </nav>
    } }
  `,
  styles: [
    `
      :host {
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
        .docs-button {
          inline-size: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
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
        }
      }
      .workshop-logo {
        font-weight: 300;
        font-size: 0.9rem;
        margin: 0;
        mat-icon {
          font-size: 3.18rem;
          inline-size: 50px;
          block-size: 50px;
          vertical-align: middle;
        }
      }
      .section-logo {
        font-size: 1.75rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly subtype: StructuralSubtype = 'NAV';
  private readonly ngxNavigationalListService = inject(
    NgxNavigationalListService
  );

  sections = mockSections;

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
        some: this.ngxNavigationalListService.navigationData$,
      })
    )
  );
}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
