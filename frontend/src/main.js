import { getLoginScreen, getFeedScreen } from './screens.js';
if(localStorage.getItem('AUTH_KEY') !== null) getFeedScreen();
else getLoginScreen();