import React from 'react';
import {addLocaleData, IntlProvider} from 'react-intl';
import en from 'react-intl/locale-data/en';
import de from 'react-intl/locale-data/de';

import ReactDOM from 'react-dom';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import 'font-awesome/css/font-awesome.css';
import './index.css';
import App from './App';
import {HashRouter} from 'react-router-dom';

import localeData from './i18n.json';
import configuration from './config/config.json';

addLocaleData([...en, ...de]);

// Define user's language. Different browsers have the user locale defined
// on different fields on the `navigator` object, so we make sure to account
// for these different by checking all of them
const language = (navigator.languages && navigator.languages[0]) ||
    navigator.language ||
    navigator.userLanguage;

// Split locales with a region code
const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

// Try full locale, try locale without region code, fallback to 'en'
const messages = localeData[languageWithoutRegionCode] || localeData[language] || localeData.en;

ReactDOM.render(
    <IntlProvider locale={language} messages={messages}>
        <HashRouter>
            <App config={configuration}/>
        </HashRouter>
    </IntlProvider>,
    document.getElementById('root'),
);

// Enable popovers everywhere
const popoverInterval = setInterval(() => {
    const popovers = $('[data-toggle="popover"]');

    if (popovers.length > 0) {
        $('[data-toggle="popover"]').popover();
        $('.popover-dismiss').popover({
            trigger: 'focus'
        });

        clearInterval(popoverInterval);
    }
}, 1000);
