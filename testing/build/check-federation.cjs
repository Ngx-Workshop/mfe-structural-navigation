const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

// Evaluate emitted webpack factories, not source-level mocks. The minimal DOM
// only supports script loading and import-time feature detection; UI rendering
// is outside the scope of this import-time regression check.
function loadContainer(directory) {
  const context = vm.createContext({
    console,
    setTimeout,
    clearTimeout,
    URL,
    TextEncoder,
    TextDecoder,
    performance,
    ngDevMode: false,
    addEventListener() {},
    removeEventListener() {},
  });
  context.self = context;
  context.window = context;
  context.document = {
    currentScript: {
      tagName: 'SCRIPT',
      src: 'http://localhost/remoteEntry.js',
    },
    getElementsByTagName: () => [],
    createElement: () => ({
      setAttribute() {},
      getAttribute() {},
      parentNode: { removeChild() {} },
    }),
    head: {
      appendChild(script) {
        queueMicrotask(() => {
          try {
            const filename = path.join(
              directory,
              path.basename(script.src)
            );
            vm.runInContext(
              fs.readFileSync(filename, 'utf8'),
              context,
              { filename }
            );
            script.onload?.({ type: 'load', target: script });
          } catch (error) {
            console.error(error);
            script.onerror?.({ type: 'error', target: script });
          }
        });
      },
    },
  };
  let entry = fs.readFileSync(
    path.join(directory, 'remoteEntry.js'),
    'utf8'
  );
  // Bridge the emitted ESM container exports into an isolated script context.
  const exports = /export\s*\{\s*(\w+) as get,\s*(\w+) as init\s*\};?/;
  assert.match(
    entry,
    exports,
    'Expected ESM federation container exports'
  );
  entry = entry
    .replace(exports, 'globalThis.container={get:$1,init:$2};')
    .replaceAll(
      'import.meta.url',
      JSON.stringify('http://localhost/remoteEntry.js')
    );
  vm.runInContext(entry, context, { filename: 'remoteEntry.js' });
  return context.container;
}

async function checkComponent(container) {
  const component = (await container.get('./Component'))();
  assert.equal(typeof component.App, 'function');
  assert.equal(component.default, component.App);
  assert.ok(
    component.App.ɵcmp,
    'Missing compiled component definition'
  );
}

async function main() {
  const directories = process.argv.slice(2).map((directory) =>
    path.resolve(directory)
  );
  assert.ok(directories.length, 'Pass one or more built remote directories');

  // Each remote must work with its own fallback dependencies.
  for (const directory of directories) {
    const container = loadContainer(directory);
    await container.init({});
    await checkComponent(container);
    console.log(`PASS isolated ./Component: ${directory}`);
  }

  if (directories.length > 1) {
    // Exercise shared providers in both registration orders, with simultaneous
    // component loading, as happens when the shell renders structural remotes.
    for (const order of [directories, [...directories].reverse()]) {
      const scope = {};
      const containers = order.map(loadContainer);
      for (const container of containers) await container.init(scope);
      await Promise.all(containers.map(checkComponent));
      console.log(`PASS concurrent shared ./Component: ${order.join(', ')}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
