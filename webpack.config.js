const {
  withModuleFederationPlugin,
} = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'ngx-navigation-mfe',
  filename: 'remoteEntry.js',

  exposes: {
    './Component': './src/app/app.ts',
  },

  shared: {
    '@angular/core': {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    },
    '@angular/common': {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    },
    '@angular/router': {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    },
    '@angular/forms': {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    },

    // If you use Material/CDK, share them too
    '@angular/cdk': {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    },
    '@angular/material': {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    },

    // RxJS + tslib
    rxjs: {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    },
    tslib: {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    },

    // Only if you’re NOT zoneless:
    'zone.js': {
      singleton: true,
      strictVersion: true,
      requiredVersion: 'auto',
    },
  },
});
