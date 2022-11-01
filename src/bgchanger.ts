import $ from 'jquery';
import moment from 'moment';
import CryptoJS from 'crypto-js';

const random = Math.floor( Math.random() * 5 );
//images
const normal = require(`./images/${ random }.png`);

let img: any | undefined = normal;


if(img !== undefined) {
    $('.neko').css({
        'background-image' : `url(${img})`

    });

}

