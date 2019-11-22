import {
    toDateTime
} from './helpers.js'
import {
    getUserProfile,
    getEditPostPage,
    getNewPostPage,
    getProfileScreen
} from './screens.js'
import API from './api.js';
const api = new API();

/**
 * You don't have to use this but it may or may not simplify element creation
 * 
 * @param {string}  tag     The HTML element desired
 * @param {any}     data    Any textContent, data associated with the element
 * @param {object}  options Any further HTML attributes specified
 */
export function createElement(tag, data, options = {}) {
    const el = document.createElement(tag);
    el.textContent = data;

    // Sets the attributes in the options object to the element
    return Object.entries(options).reduce(
        (element, [field, value]) => {
            element.setAttribute(field, value);
            return element;
        }, el);
}

/**
 * Given a post, return a tile with the relevant data
 * @param   {object}        post 
 * @returns {HTMLElement}
 */
export function createPostTile(postNumber) {
    const section = createElement('section', null, {
        class: 'post'
    });
    api.getPost(postNumber).then(post => {
        const postBlock = createElement('div', null, {
            id: `${post.id}`
        });
        postBlock.addEventListener('click', postClick);
        let editSpan = createElement('span', null, {
            style: 'float: right'
        });
        let editBt = createElement('i', null, {
            class: 'icon-edit',
            id: 'edit'
        });
        let deleteBt = createElement('i', null, {
            class: 'icon-trash-empty',
            id: 'delete'
        });
        editSpan.appendChild(editBt);
        editSpan.appendChild(deleteBt);
        let currUser = JSON.parse(localStorage.getItem('CURR_USER'));
        if (post.meta.author === currUser.username) postBlock.appendChild(editSpan);
        postBlock.appendChild(createElement('img', null, {
            src: `data:image/png;base64,${post.src}`,
            alt: post.meta.description_text,
            class: 'post-image',
        }));
        let detailsDiv = createElement('div', null, {});
        detailsDiv.appendChild(createElement('span', `${post.meta.author}`, {
            class: 'authorName',
            id: 'author'
        }))
        detailsDiv.appendChild(createElement('span', `: ${post.meta.description_text}`, {}))
        detailsDiv.appendChild(createElement('div', `${toDateTime(post.meta.published)}`, {}))
        postBlock.appendChild(detailsDiv);
        let likesBlock = createElement('div', null, {
            id: 'likesBlock'
        });
        let likeBt = createElement('i', `${post.meta.likes.length}`, {})
        if (post.meta.likes.includes(currUser.id)) {
            likeBt.id = 'unlike';
            likeBt.className = 'icon-heart-filled'
        } else {
            likeBt.id = 'like';
            likeBt.className = 'icon-heart'
        }

        let commentBt = createElement('i', `${post.comments.length}`, {
            class: 'icon-comment',
            id: 'addComment'
        });

        let nLikes = createElement('span', 'Show Likes', {
            class: 'links',
            id: 'nLikes'
        });

        if (post.meta.likes.length == 0) nLikes.className = 'hide';


        likesBlock.appendChild(likeBt);
        likesBlock.appendChild(commentBt);
        likesBlock.appendChild(nLikes);
        postBlock.appendChild(likesBlock);
        section.appendChild(postBlock);
    });
    return section;
}

export function uploadImage(event) {
    const [file] = event.target.files;

    const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg']
    const valid = validFileTypes.find(type => type === file.type);

    if (!valid)
        return false;

    const reader = new FileReader();

    reader.onload = (e) => {
        const dataURL = e.target.result;
        const image = createElement('img', null, {
            src: dataURL
        });
        document.body.appendChild(image);
    };

    reader.readAsDataURL(file);
}

export function loadFeed(p, n) {
    if(document.getElementById('tempLoading') !== null) 
        document.getElementById('large-feed').removeChild(document.getElementById('tempLoading'));
    let load = false;

    if (p == 0) document.getElementById('large-feed').innerHTML = '';
    api.getFeedByPN(p, n).then(
        ({
            posts
        }) => {
            posts.reduce((parent, post) => {
                parent.appendChild(createPostTile(post.id));
                return parent;
            }, document.getElementById('large-feed'))
            return posts;
        }).then(posts => {
        window.addEventListener('scroll', function () {
            if (amountscrolled() >= 99 && load === false) {
                load = true;
                if(posts != 0) document.getElementById('large-feed').appendChild(createElement('img', null, {
                    id: 'tempLoading',
                    class: 'loader',
                    src: 'styles/loader.gif'
                }));
                setTimeout(function () {
                    loadFeed(p + n, n);
                }, 1000);
            }

        }, false)

        function getDocHeight() {
            var D = document;
            return Math.max(
                D.body.scrollHeight, D.documentElement.scrollHeight,
                D.body.offsetHeight, D.documentElement.offsetHeight,
                D.body.clientHeight, D.documentElement.clientHeight
            )
        }

        function amountscrolled() {
            var winheight = window.innerHeight || (document.documentElement || document.body).clientHeight
            var docheight = getDocHeight()
            var scrollTop = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
            var trackLength = docheight - winheight
            var pctScrolled = Math.floor(scrollTop / trackLength * 100)
            return pctScrolled;
        }
    });
}

export function loadUserFeed(userName) {
    api.getUserByUsername(userName).then(
        ({
            posts
        }) => {
            posts.reduce((parent, post) => {
                parent.appendChild(createPostTile(post));
                return parent;
            }, document.getElementById('large-feed'))
        });
}

export function makeNewPost() {
    const submitPost = document.getElementById('newPostForm')
    let strImage;

    if (this.files && this.files[0]) {

        var FR = new FileReader();
        const main = document.getElementsByTagName('main')[0];

        FR.addEventListener('load', function (e) {
            if (main.querySelector('#imgUpload') !== null && main.querySelector('#imgUpload') !== undefined)
                main.removeChild(main.querySelector('#imgUpload'));
            main.appendChild(createElement('img', null, {
                class: 'post-image imgCenter',
                src: `${e.target.result}`,
                id: 'imgUpload'
            }))
            strImage = e.target.result.replace(/^data:image\/[a-z]+;base64,/, '');
        });

        FR.readAsDataURL(this.files[0]);

    }
    if (!(submitPost === null)) submitPost.addEventListener('submit', (event) => {
        event.preventDefault()
        api.makePost({
            description_text: `${submitPost.querySelector('#description').value}`,
            src: `${strImage}`
        }).
        then(
            response => {
                if (response.post_id !== null && response.post_id !== undefined) {
                    alert('Successfully posted');
                    getNewPostPage();
                } else alert('Something went wrong, try again!');
            });
    });
}

export function submitEditPost(id) {
    document.getElementById('editPostBt').addEventListener('change', () => {
        submitEditPost(id)
        return;
    });
    const editPost = document.getElementById('editPostForm')
    let strImage = document.getElementById('imgUpload').src;
    let inputElement = document.getElementById('editPostBt');

    if (inputElement !== undefined && inputElement.files && inputElement.files[0]) {
        var FR = new FileReader();
        FR.addEventListener('load', function (e) {
            document.getElementById('imgUpload').src = `${e.target.result}`,
                strImage = e.target.result
        });
        FR.readAsDataURL(inputElement.files[0]);
    }
    if (!(editPost === null)) editPost.addEventListener('submit', (event) => {
        event.preventDefault();
        strImage = strImage.replace(/^data:image\/[a-z]+;base64,/, '');
        api.editPost(id, {
            description_text: `${editPost.querySelector('#description').value}`,
            src: `${strImage}`
        }).
        then(
            response => {
                if (response.message === 'success') {
                    alert('Successfully Updated');
                    getProfileScreen();

                } else alert('Something went wrong, try again!');
            });
    });
}

function postClick(event) {
    if (event.target.id === 'nLikes') viewLikers(event);
    if (event.target.id === 'like') {
        likePost(event);
        return;
    }
    if (event.target.id === 'unlike') unlikePost(event);
    if (event.target.id === 'addComment') {
        addComment(event);
        viewComments(event);
    }
    if (event.target.id === 'author') {
        api.getPost(event.target.parentElement.parentElement.id).then(post => {
            getUserProfile(post.meta.author);
        });
    }
    if (event.target.id === 'delete') deletePost(event);
    if (event.target.id === 'edit') editPost(event);
}

function editPost(event) {
    getEditPostPage(event.target.parentElement.parentElement.id);
}


function likePost(event) {
    let parent = event.target.parentElement.parentElement;
    let id = parent.id;
    event.target.className = 'icon-heart-filled';
    event.target.id = 'unlike';
    event.target.innerText = `${parseInt(event.target.innerText) + 1}`;
    parent.querySelector('#nLikes').className = 'links';
    let currUser = JSON.parse(localStorage.getItem('CURR_USER'));
    if (parent.querySelector('#likers') !== null) {
        parent.querySelector('#likers').className = '';
        parent.querySelector('#likers').innerHTML += `${currUser.name}<br>`;
    }
    api.likePost(id);
}

function unlikePost(event) {
    let currUser = JSON.parse(localStorage.getItem('CURR_USER'));
    let parent = event.target.parentElement.parentElement;
    let id = parent.id;
    event.target.className = 'icon-heart';
    event.target.id = 'like';
    event.target.innerText = `${parseInt(event.target.innerText) - 1}`;
    if (parseInt(event.target.innerText) == 0) {
        parent.querySelector('#nLikes').className = 'hide';
        if (parent.querySelector('#likers') !== null) {
            parent.querySelector('#likers').className = 'hide';
            parent.querySelector('#likers').innerHTML = '';
        }
    } else {
        parent.querySelector('#nLikes').className = 'links';
        parent.querySelector('#likers').className = '';
    }
    if (parent.querySelector('#likers') !== null) {
        let newLikers = parent.querySelector('#likers').innerHTML.split('<br>');
        newLikers = newLikers.filter((user) => user !== currUser.name).join('<br>');
        parent.querySelector('#likers').innerHTML = `${newLikers}`;
    }
    api.unlikePost(id);
}

function viewLikers(event) {
    let postId = event.target.parentElement.parentElement.id;
    let parent = event.target.parentElement;
    if (parent.querySelector('#comments') !== null) {
        parent.querySelector('#comments').className = 'hide';
        parent.querySelector('#newCommentForm').className = 'hide';
    }
    if (parent.querySelector('#likers') !== null) parent.removeChild(parent.querySelector('#likers'));
    else {
        let likers = createElement('h6', '', {
            id: 'likers'
        })
        api.getPost(postId)
            .then(post => post.meta.likes)
            .then(likes => {
                if (likes.length > 0) {
                    likers.innerHTML = '';
                    likes.forEach(like => {
                        api.getUserById(like)
                            .then(user => likers.innerHTML += `${user.name}<br>`)
                    })
                } else {
                    likers.innerHTML = '';
                }
            });
        parent.appendChild(likers);
    }
}

function viewComments(event) {
    let postId = event.target.parentElement.parentElement.id;
    let parent = event.target.parentElement;
    if (parent.querySelector('#likers') !== null) parent.removeChild(parent.querySelector('#likers'));
    if (parent.querySelector('#comments') !== null) {
        if (parent.querySelector('#comments').className === 'hide') parent.querySelector('#comments').className = '';
        else parent.removeChild(parent.querySelector('#comments'));
    } else {
        let comments = createElement('h6', '', {
            id: 'comments'
        })
        api.getPost(postId)
            .then(post => post.comments)
            .then(commentsList => {
                if (commentsList.length > 0) {
                    commentsList.reverse().forEach(comment => comments.innerHTML += `${comment.author}: ${comment.comment}<br>`)
                } else {
                    comments.innerHTML = '';
                }
            });
        parent.appendChild(comments);
    }
}

function addComment(event) {
    let parent = event.target.parentElement;
    if (parent.querySelector('#likers') !== null) parent.removeChild(parent.querySelector('#likers'));
    if (parent.querySelector('#newCommentForm') !== null) {
        if (parent.querySelector('#newCommentForm').className === 'hide') parent.querySelector('#newCommentForm').className = '';
        else parent.removeChild(parent.querySelector('#newCommentForm'));
    } else {
        let newCommentForm = createElement('form', null, {
            id: 'newCommentForm'
        });
        newCommentForm.addEventListener('submit', postComment);
        let newComment = createElement('input', null, {
            id: 'newComment',
            class: 'input-text',
            placeholder: 'Add new comment here',
            autocomplete: 'off'
        })
        newComment.required = true;
        newCommentForm.appendChild(newComment);
        parent.appendChild(newCommentForm);
    }
}

function postComment(event) {
    let parent = event.target.id === 'newCommentForm' ? event.target.parentElement.parentElement : event.target.parentElement.parentElement.parentElement;
    let id = parent.id;
    let comments = parent.querySelector('#addComment');
    comments.innerText = `${parseInt(comments.innerText) + 1}`;
    event.preventDefault();
    let currUser = JSON.parse(localStorage.getItem('CURR_USER'));
    if (parent.querySelector('#comments') !== null) {
        if (parseInt(comments.innerText) == 1) parent.querySelector('#comments').innerHTML = `${currUser.username}: ${event.target.querySelector('#newComment').value}<br>`;
        else parent.querySelector('#comments').innerHTML = `${currUser.username}: ${event.target.querySelector('#newComment').value}<br>` + parent.querySelector('#comments').innerHTML;
    }
    api.makeComment({
        author: `${currUser.username}`,
        published: '',
        comment: `${event.target.querySelector('#newComment').value}`
    }, id).then(response => {
        event.target.querySelector('#newComment').value = null;
    });
}

function deletePost(event) {
    let parent = event.target.id === 'delete' ? event.target.parentElement.parentElement : event.target.parentElement.parentElement.parentElement;
    let id = parent.id;
    document.getElementById('large-feed').removeChild(document.getElementById(`${id}`).parentElement);
    document.getElementById('nPosts').innerText = `${parseInt(document.getElementById('nPosts').innerText) - 1}`;
    api.deletePost(id);
}