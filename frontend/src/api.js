const API_URL = 'http://localhost:5000/'

const getJSON = (path, options) =>
    fetch(path, options)
    .then(res => res.json())
    .catch(err => err);

export default class API {

    /**
     * Defaults to teh API URL
     * @param {string} url 
     */
    constructor(url = API_URL) {
        this.url = url;
    }

    apiRequest(method, path, body) {
        return getJSON(`${this.url}${path}`, {
            method: `${method}`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Token ${window.localStorage.getItem('AUTH_KEY')}`
            },
            body: JSON.stringify(body)
        });
    }

    getPost(id){
        return this.apiRequest('GET', `post/?id=${id}`);
    }

    getFeed() {
        return this.apiRequest('GET', 'user/feed');
    }

    getFeedByNumber(n){
        return this.apiRequest('GET', `user/feed/?n=${n}`);
    }

    
    getFeedByStartingPost(p){
        return this.apiRequest('GET', `user/feed/?p=${p}`);
    }

    getFeedByPN(p,n){
        return this.apiRequest('GET', `user/feed/?p=${p}&n=${n}`);
    }

    register(user) {
        return this.apiRequest('POST', 'auth/signup', user);
    }

    login(credentials) {
        return this.apiRequest('POST', 'auth/login', credentials);
    }

    getUser() {
        return this.apiRequest('GET', 'user');
    }

    getUserByUsername(username){
        return this.apiRequest('GET', `user/?username=${username}`);
    }

    
    getUserById(id){
        return this.apiRequest('GET', `user/?id=${id}`);
    }

    getUserByUsernameAndId(username, id){
        return this.apiRequest('GET', `user/?username=${username}&id=${id}`);
    }

    likePost(id){
        return this.apiRequest('PUT', `post/like?id=${id}`);
    }

    unlikePost(id){
        return this.apiRequest('PUT', `post/unlike?id=${id}`);
    }

    updateUser(user){
        return this.apiRequest('PUT', 'user', user);
    }

    makePost(post){
        return this.apiRequest('POST', 'post', post);
    }

    makeComment(comment, postId){
        return this.apiRequest('PUT', `post/comment?id=${postId}`, comment);   
    }

    follow(user){
        return this.apiRequest('PUT', `user/follow?username=${user}`);   
    }

    unfollow(user){
        return this.apiRequest('PUT', `user/unfollow?username=${user}`);   
    }

    deletePost(post){
        return this.apiRequest('DELETE', `post/?id=${post}`)
    }

    editPost(id, post){
        return this.apiRequest('PUT', `post/?id=${id}`, post)

    }
}
