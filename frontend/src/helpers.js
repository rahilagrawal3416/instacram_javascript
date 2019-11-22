import API from './api.js';
const api = new API();


/* returns an empty array of size max */
export const range = (max) => Array(max).fill(null);

/* returns a randomInteger */
export const randomInteger = (max = 1) => Math.floor(Math.random() * max);

/* returns a randomHexString */
const randomHex = () => randomInteger(256).toString(16);

/* returns a randomColor */
export const randomColor = () => '#' + range(3).map(randomHex).join('');

export function toDateTime(secs) {
    var t = new Date(1970, 0, 2);
    t.setSeconds(secs);
    return new Date(t).toUTCString().split(' ').slice(0, 5).join(' ');
}