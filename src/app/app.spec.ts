import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NgxNavigationalListService } from '@tmdjr/ngx-navigational-list';
import { of } from 'rxjs';
import { App } from './app';

describe('Structural navigation', () => {
  const navigation = {
    setRoleState: jasmine.createSpy('setRoleState'),
    getFilteredNavigationBySubtypeAndState: jasmine
      .createSpy('filter')
      .and.callFake((_subtype: string, mode: string) =>
        of([
          {
            menuItemText: `${mode} home`,
            routeUrl: 'home',
            navSvgPath: 'home',
            headerSvgPath: 'home',
            children: [],
          },
          {
            menuItemText: `${mode} resources`,
            navSvgPath: 'school',
            headerSvgPath: 'school',
            children: [
              {
                menuItemText: `${mode} workshops`,
                routeUrl: 'workshops',
                navSvgPath: 'science',
                headerSvgPath: 'science',
                children: [],
              },
            ],
          },
        ])
      ),
  };
  beforeEach(async () => {
    navigation.setRoleState.calls.reset();
    navigation.getFilteredNavigationBySubtypeAndState.calls.reset();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        provideRouter([]),
        { provide: NgxNavigationalListService, useValue: navigation },
      ],
    }).compileComponents();
  });

  it('hides disabled chrome, including the mobile toggle and all menu items', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
    expect(navigation.getFilteredNavigationBySubtypeAndState).not.toHaveBeenCalled();
  });

  it('uses mode-specific data and resets disclosure on mode/role changes', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentRef.setInput('role', 'admin');
    for (const mode of ['full', 'relaxed', 'compact']) {
      fixture.componentRef.setInput('mode', mode);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('nav').dataset.mode).toBe(mode);
      expect(fixture.nativeElement.textContent).toContain(`${mode.toUpperCase()} home`);
      expect(fixture.nativeElement.textContent).not.toContain(
        `${mode === 'compact' ? 'FULL' : 'COMPACT'} home`
      );
      const toggle = fixture.nativeElement.querySelector('.mobile-toggle') as HTMLButtonElement;
      toggle.click();
      fixture.detectChanges();
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      fixture.nativeElement
        .querySelector('nav')
        .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      fixture.detectChanges();
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      fixture.componentInstance.mobileOpen.set(true);
    }
    fixture.componentRef.setInput('role', 'publisher');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.mobileOpen()).toBeFalse();
    expect(navigation.setRoleState).toHaveBeenCalledWith('publisher');
    fixture.componentRef.setInput('mode', 'disabled');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });

  it('uses a native button and Material menu for children; mode changes close the overlay', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentRef.setInput('role', 'admin');
    fixture.componentRef.setInput('mode', 'full');
    fixture.detectChanges();
    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector('button.nav-item') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector('[role="menu"]')?.textContent).toContain('FULL workshops');
    fixture.componentRef.setInput('mode', 'compact');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
