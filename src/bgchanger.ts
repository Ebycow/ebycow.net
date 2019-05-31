import $ from 'jquery';
import moment from 'moment';
import CryptoJS from 'crypto-js';

console.log(document.referrer)

//images
const normal = require('./images/img4.jpg');
const summer = require('./images/img2.jpg');
const swimsuit = require('./images/img3.jpg');
const sub = require('./images/img4').img;

let img: any | undefined = normal;

const month: number = parseInt(moment().format('MM'));
if(month >= 6 && month <= 10){
    img = summer;

}

const rnd: number = Math.random();
if(rnd < 0.01){
    img = swimsuit;

}

if(rnd < 0.001){
    img = undefined;

}

if(img !== undefined) {
    $('.neko').css({
        'background-image' : `url(${img})`

    });

}


setTimeout(() => {
    if(rnd < 0.001){
        const value = 110312180975097;
        const _ = (`${value}`).split(/3|5|8/);

        $('.neko').css({
            'background-image' : `url(data:image/jpeg;base64,${CryptoJS.AES.decrypt(sub, String.fromCharCode(~~_[1*0],-(-_[2-1]),-_[~~2]*-1,+_[~~Math.PI])).toString(CryptoJS.enc.Utf8)})`

        });

    }

}, 600000);