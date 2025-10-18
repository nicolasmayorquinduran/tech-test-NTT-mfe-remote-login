const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

const config =  withModuleFederationPlugin({

  name: 'mf-login',

  exposes: {
    './AuthModule': './src/app/auth/auth.module.ts',
  },

  shared: {
    ...shareAll({ 
      singleton: true, 
      strictVersion: true, 
      requiredVersion: 'auto' 
    }),
    // Excluir 'shared' porque es una librería local (file:)
    'shared': { 
      singleton: false,
      strictVersion: false,
      requiredVersion: false
    }
  },

});

config.output.publicPath = 'http://localhost:4201/';

module.exports = config


