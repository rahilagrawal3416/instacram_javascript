import {
    submitRegisteration,
    login
} from './login.js';
import {
    loadFeed,
    loadUserFeed,
    makeNewPost,
    createElement,
    submitEditPost
} from './posts.js';
import API from './api.js';
const api = new API();
const main = document.getElementsByTagName('main')[0];

export function getLoginScreen() {
    document.getElementById('loginBanner').className = 'hide';
    main.innerHTML = '';
    let loginBlock = document.createElement('div');
    loginBlock.className = 'center';
    loginBlock.id = 'loginBlock';
    loginBlock.innerHTML = '<form id=\'loginForm\'>' +
        '<input class="input-text" id=\'username\' placeholder="Username" required /><br>' +
        '<input class="input-text" id=\'password\' type="password" placeholder="Password" required /><br><br>' +
        '<button id=\'loginBt\' type="submit" class="button6Save"><i class="icon-login"></i></button>' +
        '<i class="icon-id-card-o" id=\'registerBt\'></i>' +
        '</form>';
    main.appendChild(loginBlock);
    const loginForm = document.getElementById('loginForm');
    if (!(loginForm === null)) loginForm.addEventListener('submit', login);

    const registerBt = document.getElementById('registerBt');
    if (!(registerBt === null)) registerBt.addEventListener('click', getRegistrationScreen);

}

export function getRegistrationScreen() {
    main.innerHTML = '';
    let registerBlock = document.createElement('div');
    registerBlock.className = 'center';
    registerBlock.id = 'registerBlock';
    registerBlock.innerHTML = '<form id=\'registrationForm\'>' +
        'Name <input  class="input-text" id=\'name\' type="text" required autocomplete="off"/> <br>' +
        'Email <input  class="input-text" id=\'email\' type="email" required autocomplete="off"/> <br>' +
        'Username <input  class="input-text" id=\'username\' type="text" required autocomplete="off"/> <br>' +
        'Password <input  class="input-text" id=\'password\' type="password" required /> <br><br>' +
        '<button id=\'registerSubmit\' type="submit" class="button6Save"><i class="icon-id-card-o"></i></button>' +
        '<i class="icon-login" id=\'loginBt\'></i>' +
        '</form>';
    main.appendChild(registerBlock);

    const loginBt = document.getElementById('loginBt');
    if (!(loginBt === null)) loginBt.addEventListener('click', getLoginScreen);

    const registerForm = document.getElementById('registrationForm');
    if (!(registerForm === null)) registerForm.addEventListener('submit', submitRegisteration);

}

export function getProfileScreen() {
    main.innerHTML = '';
    let userDetails = createElement('span', null, {
        class: 'profileDetails'
    });
    let profileDiv = createElement('div', null, {});
    profileDiv.id = 'profile';
    profileDiv.innerHTML = '<form id=\'profileForm\'>' +
        'Name <input  class="input-text" id=\'name\' type="text" required /> <br>' +
        'Email <input  class="input-text" id=\'email\' type="email" required /> <br>' +
        'Username <input  class="input-text" id=\'username\' type="text" required /> <br>' +
        'Password <input  class="input-text" id=\'password\' type="password" required /> <br><br>' +
        '<button type="submit" class="button6Save"><i class="icon-floppy"></i></button>' +
        '</form><br><br>';
    userDetails.appendChild(profileDiv);
    main.appendChild(userDetails);
    let currUser = JSON.parse(localStorage.getItem('CURR_USER'));
    api.getUser().then(user => {
        currUser = user;
        window.localStorage.setItem('CURR_USER', JSON.stringify(user));
        let profile = document.getElementById('profileForm');
        (profile.querySelector('#name')).setAttribute('value', `${user.name}`);
        (profile.querySelector('#email')).setAttribute('value', `${user.email}`);
        (profile.querySelector('#password')).setAttribute('value', `${window.localStorage.getItem('USER_PASS')}`);
        (profile.querySelector('#username')).setAttribute('value', `${user.username}`);
        (profile.querySelector('#username')).setAttribute('disabled', 'disabled');
        profile.addEventListener('submit', (event) => {
            event.preventDefault();

            let email = (profile.querySelector('#email')).value;
            let name = (profile.querySelector('#name')).value;
            let password = (profile.querySelector('#password')).value;
            if (email === '' || name === '') {
                alert('Name and Email cannot be Empty');
            } else {
                api.updateUser({
                        'email': `${email}`,
                        'name': `${name}`,
                        'password': `${password}`
                    })
                    .then(response => {
                        if (response.msg === 'success') {
                            document.getElementById('welcomeMessage').innerText = `${name}`;
                            alert('Details Successfully Updated!');
                        } else alert('Something went wrong, try again!');
                    });
            }
        });
        let detailSpan = createElement('div', null, {});
        detailSpan.appendChild(createElement('i', null, {
            class: 'icon-users-outline'
        }));
        detailSpan.appendChild(createElement('span', `${currUser.followed_num}`, {
            id: 'nFollowers'
        }))
        detailSpan.appendChild(createElement('i', null, {
            class: 'icon-picture-outline'
        }));
        detailSpan.appendChild(createElement('span', `${currUser.posts.length}`, {
            id: 'nPosts'
        }))
        userDetails.appendChild(detailSpan)
    });
    let feed = createElement('span', null, {
        style: 'float: left; padding-left: 50px;'
    });
    feed.id = 'large-feed';
    main.appendChild(feed);
    loadUserFeed(currUser.username);

}

export function getFeedScreen() {
    api.getUser()
        .then(user => {
            document.getElementById('welcomeMessage').innerText = `${user.name}`;
            document.getElementById('loginBanner').className = '';
        })
    main.innerHTML = '';
    main.appendChild(createElement('div', null, {id: 'large-feed'}));

    loadFeed(0, 3);

    const profileBt = document.getElementById('profileBt')
    if (!(profileBt === null)) profileBt.addEventListener('click', getProfileScreen);

    const logout = document.getElementById('logout')
    if (!(logout === null)) logout.addEventListener('click', () => {
        window.localStorage.clear();
        getLoginScreen();
    });
    const feedBt = document.getElementById('feedBt')
    if (!(feedBt === null)) feedBt.addEventListener('click', getFeedScreen);

    const newPostBt = document.getElementById('newPost')
    if (!(newPostBt === null)) newPostBt.addEventListener('click', getNewPostPage);

    const searchForm = document.getElementById('searchForm');
    if (!(searchForm === null)) searchForm.addEventListener('submit', searchUser);

}

export function getNewPostPage() {
    main.innerHTML = '';
    let postBt = document.createElement('div');
    postBt.id = 'postBtBlock';
    main.appendChild(postBt);
    postBt.innerHTML = '<form id=\'newPostForm\' class="center">' +
        '<div class="upload-btn-wrapper"><button class="btn">Upload a file</button><input required type="file" id=\'newPostBt\' accept="image/*" style="width: 100%;"/></div>' +
        '<input class="input-text" id=\'description\' type="text" placeholder="Description" required/>' +
        '<button type="submit" class="button6Save"><i class="icon-floppy"></i></button>' +
        '<i class="icon-cancel-outline" id=\'resetBt\'></i>' +
        '</form>';

    const newPostBt = document.getElementById('newPostBt')
    if (!(newPostBt === null)) newPostBt.addEventListener('change', makeNewPost);

    document.getElementById('resetBt').addEventListener('click', getNewPostPage);
}

export function getEditPostPage(id) {
    main.innerHTML = '';
    let postBt = document.createElement('div');
    postBt.id = 'postBtBlock';
    main.appendChild(postBt);
    let imageSrc;
    let imageDesc;
    api.getPost(id).then(post => {
        imageSrc = post.src;
        imageDesc = post.meta.description_text;

        postBt.innerHTML = '<form id=\'editPostForm\' style="margin-left: 30%;">' +
            '<input class="button6" type="file" id=\'editPostBt\' accept="image/*" /><br>' +
            `<input class="input-text" id='description' type="text" placeholder="Description" required value="${imageDesc}" style="width: 450px;"/>` +
            `<img class="post-image" id='imgUpload' src='data:image/gif;base64,${imageSrc}'/><br>` +
            '<button type="submit" class="button6Save"><i class="icon-floppy"></i></button>' +
            '<i class="icon-cancel-outline" id=\'cancelBt\'></i>' +
            '</form>';
        document.getElementById('cancelBt').addEventListener('click', getProfileScreen)
        submitEditPost(id);
    });


}

export function getUserProfile(userName) {
    main.innerHTML = '';
    let currUser = JSON.parse(localStorage.getItem('CURR_USER'));
    if (currUser.username === userName) {
        getProfileScreen();
        return;
    }
    api.getUserByUsername(userName).then(user => {
        let detailSpan = createElement('span', null, {});
        detailSpan.appendChild(createElement('h6', `Username: ${user.username}`, {}));
        detailSpan.appendChild(createElement('h6', `Name: ${user.name}`, {}));
        detailSpan.appendChild(createElement('i', null, {
            class: 'icon-users-outline'
        }));
        detailSpan.appendChild(createElement('span', `${user.followed_num}`, {
            id: 'nFollowers'
        }))
        detailSpan.appendChild(createElement('i', null, {
            class: 'icon-picture-outline'
        }));
        detailSpan.appendChild(createElement('span', `${user.posts.length}`, {
            id: 'nPosts'
        }))
        let followBt = createElement('i', null, {
            id: 'followBt'
        });
        followBt.addEventListener('click', () => {
            refreshProfile(userName)
        });
        main.appendChild(detailSpan);
        main.appendChild(followBt);
        main.appendChild(createElement('div', null, {
            id: 'large-feed'
        }));
        loadUserFeed(userName);
        api.getUser().then(currUser => {
            localStorage.setItem('CURR_USER', JSON.stringify(currUser));
            if (currUser.following.includes(user.id)) {
                followBt.className = 'icon-user-delete-outline';
            } else {
                followBt.className = 'icon-user-add-outline';
                document.getElementById('large-feed').className = 'hide';
            }
        });
    });
}

function refreshProfile(userName) {
        let nFollowers = parseInt((document.getElementById('nFollowers')).innerText);
        let followBt = document.getElementById('followBt');
        api.getUser().then(currUser => {
            localStorage.setItem('CURR_USER', JSON.stringify(currUser));
            if (followBt.className === 'icon-user-add-outline') {
                followBt.className = 'icon-user-delete-outline';
                document.getElementById('large-feed').className = '';
                (document.getElementById('nFollowers')).innerText = `${nFollowers + 1}`
                api.follow(userName);
            } else {
                followBt.className = 'icon-user-add-outline';
                document.getElementById('large-feed').className = 'hide';
                (document.getElementById('nFollowers')).innerText = `${nFollowers - 1}`
                api.unfollow(userName)
            }
    });
}

function searchUser(event) {
    event.preventDefault();
    let formElm = event.target;
    let searchElm = formElm.querySelector('#search');
    let userName = searchElm.value.toLowerCase();
    if (formElm.querySelector('#result') !== null && formElm.querySelector('#result') !== undefined) {
        formElm.removeChild(formElm.querySelector('#result'));
        formElm.removeChild(formElm.querySelector('#clearSearch'));
    }
    let userLink;
    api.getUserByUsername(userName).then(user => {
        if (user.message === 'User Not Found') userLink = createElement('span', 'User Not Found', {
            id: 'result'
        });
        else userLink = createElement('span', `${userName}`, {
            class: 'links',
            id: 'result'
        });
        userLink.addEventListener('click', () => {
            getUserProfile(userName);
            formElm.removeChild(userLink);
            formElm.removeChild(formElm.querySelector('#clearSearch'));
        });
        formElm.appendChild(userLink);
        formElm.appendChild(createElement('i', null, {
            id: 'clearSearch',
            class: 'icon-cancel-outline',
            style: 'float: right;'
        }))
        document.getElementById('clearSearch').addEventListener('click', () => {
            formElm.removeChild(userLink);
            formElm.removeChild(formElm.querySelector('#clearSearch'));
        })
        searchElm.value = '';
    });
}