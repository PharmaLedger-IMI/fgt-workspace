/**
 * @module pdm-web-components
 */

import * as ColorUtils from './src/utils/colorUtils';
import * as PopOverUtils from './src/utils/popOverUtils';
import * as Utils from './src/utils/utilFunctions';
import * as Services from './src/services';
import * as LocalizedController from './src/controllers/LocalizedController';
import * as HomeController from './src/controllers/HomeController';
import * as Constants from './src/utils';

export default {
  Utils: {
    Color: ColorUtils,
    PopOver: PopOverUtils,
    Functions: Utils
  },
  Services,
  Controllers : {
    LocalizedController: LocalizedController,
    HomeController: HomeController
  },
  Constants: Constants
}
