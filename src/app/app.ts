import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  inject,
  Input,
  signal,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import type { StructuralOverrideMode } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { NgxNavigationalListService, StructuralSubtype } from '@tmdjr/ngx-navigational-list';
import { ThemePickerService } from '@tmdjr/ngx-theme-picker';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { BehaviorSubject, combineLatest, filter, of, switchMap, tap } from 'rxjs';
import { MenuDeviconComponent } from './devicon.component';

type UserRole = 'admin' | 'publisher' | 'regular' | 'none';

@Component({
  selector: 'ngx-navigation-mfe',
  imports: [
    AsyncPipe,
    MatButtonModule,
    MatIcon,
    MatMenuModule,
    RouterLink,
    RouterLinkActive,
    NgxButton,
    MenuDeviconComponent,
  ],
  host: { class: 'ngx-design-system', '[attr.data-mode]': 'mode$.value' },
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly subtype: StructuralSubtype = 'NAV';
  private readonly navigation = inject(NgxNavigationalListService);
  private readonly router = inject(Router);
  private readonly doc = inject(DOCUMENT);
  private readonly triggers = viewChildren(MatMenuTrigger);
  readonly palette = inject(ThemePickerService);
  readonly themes = ThemePickerService.THEMES;
  readonly mobileOpen = signal(false);
  readonly mode$ = new BehaviorSubject<StructuralOverrideMode>('disabled');
  readonly role$ = new BehaviorSubject<UserRole>('none');

  @Input() set mode(value: StructuralOverrideMode) {
    this.closeNavigation();
    this.mode$.next(value);
  }
  @Input() set role(value: UserRole) {
    this.closeNavigation();
    this.role$.next(value);
  }

  readonly viewModel$ = combineLatest([this.mode$, this.role$]).pipe(
    tap(([, role]) => this.navigation.setRoleState(role)),
    switchMap(([mode, role]) =>
      combineLatest({
        mode: of(mode),
        role: of(role),
        menuItems:
          mode === 'disabled'
            ? of([])
            : this.navigation.getFilteredNavigationBySubtypeAndState(
                this.subtype,
                mode.toUpperCase()
              ),
      })
    )
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.closeNavigation());
  }

  closeNavigation(): void {
    this.mobileOpen.set(false);
    this.triggers().forEach((trigger) => trigger.closeMenu());
  }

  onEscape(event: Event): void {
    if (!this.mobileOpen()) return;
    this.closeNavigation();
    (event.currentTarget as HTMLElement)
      .querySelector<HTMLButtonElement>('.mobile-toggle')
      ?.focus();
  }

  redirectToLogin(): void {
    const redirect = encodeURIComponent(this.doc.defaultView?.location.href ?? '/');
    this.doc.defaultView?.location.assign(`https://auth.ngx-workshop.io?redirect=${redirect}`);
  }
}

export default App;
