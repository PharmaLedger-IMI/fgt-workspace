import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'pdm-web-components',
  globalStyle: 'node_modules/@ionic/core/css/ionic.bundle.css',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../type',
    },
    {
      type: 'dist-custom-elements-bundle',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
};
