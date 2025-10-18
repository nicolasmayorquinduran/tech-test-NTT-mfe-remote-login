const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

const config =  withModuleFederationPlugin({

  name: 'mf-login',

  exposes: {
    './AuthModule': './src/app/auth/auth.module.ts',
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

});

config.output.publicPath = 'http://localhost:4201/';

module.exports = config


