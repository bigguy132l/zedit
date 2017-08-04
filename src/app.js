// Use new ES6 modules syntax for everything.
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import fh from './helpers/fileHelpers.js';
import env from './env';
import xelib from './xelib.js';
import settingsService from './Services/settingsService.js';
import xelibService from './Services/xelibService.js';
import profileService from './Services/profileService.js';
import formUtils from './Services/formUtils.js';
import spinnerFactory from './Factories/spinnerFactory.js';
import listViewFactory from './Factories/listViewFactory.js';
import profilesModal from './Directives/profilesModal.js';
import loadOrderModal from './Directives/loadOrderModal.js';
import settingsModal from './Directives/settingsModal.js';
import hexFilter from './Filters/hexFilter.js';
import profileValidFilter from './Filters/profileValidFilter.js';
import baseView from './Views/base.js';
import startView from './Views/start.js';

// set up helpers
var fileHelpers = fh(remote, jetpack);

// initialize xelib when application starts
xelib.Initialize();

// set up angular application
var ngapp = angular.module('application', [
    'ui.router', 'ct.ui.router.extras'
]);

//this allows urls with and without trailing slashes to go to the same state
ngapp.config(function ($urlMatcherFactoryProvider) {
    $urlMatcherFactoryProvider.strictMode(false);
});

// state redirects
ngapp.run(['$rootScope', '$state', function ($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function (evt, toState, params, fromState) {
        if (toState.redirectTo) {
            evt.preventDefault();
            $state.go(toState.redirectTo, params, {location: 'replace'});
        }
    });
}]);

// SERVICES
xelibService(ngapp, xelib);
profileService(ngapp, xelib, fileHelpers);
formUtils(ngapp);
settingsService(ngapp, fileHelpers);

// FACTORIES
spinnerFactory(ngapp);
listViewFactory(ngapp);

// FILTERS
hexFilter(ngapp);
profileValidFilter(ngapp);

// DIRECTIVES
profilesModal(ngapp, fileHelpers);
loadOrderModal(ngapp, xelib);
settingsModal(ngapp, fileHelpers);

// VIEWS
baseView(ngapp, remote);
startView(ngapp);