import { TestBed } from '@angular/core/testing';
import { MenuDeviconComponent } from './devicon.component';

describe('Menu icon rendering', () => {
  it('switches between Material, Devicon, image URLs and empty values', async () => {
    const fixture = TestBed.createComponent(MenuDeviconComponent);
    const cases = [
      ['home', 'mat-icon'],
      [' devicon-angular-plain colored ', 'i.devicon-angular-plain.colored'],
      ['https://cdn.example.com/icons/123?signature=abc', 'img'],
      ['/assets/menu.svg', 'img'],
      ['assets/menu.png?v=2', 'img'],
      ['./menu.webp', 'img'],
    ];
    for (const [value, selector] of cases) {
      fixture.componentRef.setInput('icon', value);
      fixture.detectChanges();
      await fixture.whenStable();
      const element = fixture.nativeElement.querySelector(selector);
      expect(element).withContext(value).not.toBeNull();
      expect(fixture.nativeElement.children.length).toBe(1);
      if (selector === 'img') {
        expect(element.getAttribute('src')).toBe(value);
        expect(element.getAttribute('alt')).toBe('');
      }
    }
    fixture.componentRef.setInput('icon', null);
    fixture.detectChanges();
    expect(fixture.nativeElement.children.length).toBe(0);
    expect(fixture.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });
});
