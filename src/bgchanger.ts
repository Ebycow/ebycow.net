import $ from 'jquery';
import moment from 'moment';
import CryptoJS from 'crypto-js';

//images
const normal = require('./images/1.png');

let img: any | undefined = normal;


if(img !== undefined) {
    $('.neko').css({
        'background-image' : `url(${img})`

    });

}

