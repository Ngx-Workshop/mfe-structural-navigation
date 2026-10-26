# NgxNavigationMfe

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Design system and structural modes

Uses `@tmdjr/ngx-workshop-design-system` 21.0.2. The remote owns its markup and application navigation; shared tokens, NgxButton and public Material styles provide the visual system. No application menu data or mode policy is exported from the design system.

`full`, `relaxed`, and `compact` select distinct presentations. Header and rail menu data still comes from `getFilteredNavigationBySubtypeAndState` using the current role and uppercase mode. A viewport change never changes that query or substitutes a different mode. `disabled` renders no chrome.

All enabled modes adapt at 720px. Header and rail disclose their current links with a labeled mobile menu button. Escape closes the disclosure and returns focus to its toggle. Material owns submenu overlays, arrow-key navigation, Escape and focus restoration. Route, role and mode changes close open navigation. The rail is scrollable on short desktop screens. Compact desktop rail icons retain accessible names; mobile shows their labels. Footer content wraps, with touch-sized links.

Federated CSS is supplied by the shells: root Ngx tokens and button styles, plus a scoped Material adapter on `.ngx-design-system` and `.ngx-design-system-overlay`. The remote host uses the first class and its portaled menus use the second. Standalone `src/styles.scss` supplies the full theme for previews. The shells also own responsive grid allocation and the rail widths (176/136/88px).

Validation: production build and ChromeHeadless component tests. Browser review uses representative local menu data at 320, 390, 720, 1024 and 1440px across all three enabled modes; it is not a backend or deployed-service integration test.

Verified on 2026-10-26: all 45 mode/viewport combinations fit without horizontal overflow. Header and rail keyboard submenu focus/escape, route highlighting, mobile disclosure, guest sign-in visibility and palette selection passed. Desktop/mobile accessibility scans found no serious or critical violations.
