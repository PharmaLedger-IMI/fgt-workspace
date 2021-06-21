import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'pdm-web-components',
  globalStyle: 'css/globalStyles.css',
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
      serviceWorker: null, // disable service workers we have out own
    },
  ],
};
