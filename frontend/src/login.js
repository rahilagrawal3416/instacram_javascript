import API from './api.js';
import {
    getLoginScreen,
    getFeedScreen,
    getRegistrationScreen
} from './screens.js';
const api = new API();

export function login(event) {
    event.preventDefault();

    const username = (document.getElementById('loginBlock')).querySelector('#username');
    const password = (document.getElementById('loginBlock')).querySelector('#password');
    const credentials = {
        'username': `${username.value}`,
        'password': `${password.value}`
    };
    api.login(credentials)
        .then(token => {
            if (token.token !== undefined) {
                window.localStorage.setItem('AUTH_KEY', token.token);
                window.localStorage.setItem('USER_PASS', password.value);
                api.getUser().then(user => {
                    window.localStorage.setItem('CURR_USER', JSON.stringify(user));
                    document.getElementById('welcomeMessage').innerText = `${user.name}`;
                    document.getElementById('loginBanner').className = '';
                })
                getFeedScreen();
            } else alert('Incorrect Login Details');
        })
}

export function submitRegisteration(event) {
    event.preventDefault();

    const registerForm = event.target.parentNode;
    const user = {
        'username': `${registerForm.querySelector('#username').value.toLowerCase()}`,
        'password': `${registerForm.querySelector('#password').value}`,
        'email': `${registerForm.querySelector('#email').value}`,
        'name': `${registerForm.querySelector('#name').value}`
    };

    api.register(user)
        .then(token => {
            if (token.message === 'Malformed Request') alert('Invalid Input');
            else if (token.message === 'Username Taken') alert('Username is already taken');
            else getLoginScreen();
        })
}

export function register() {
    getRegistrationScreen();
}