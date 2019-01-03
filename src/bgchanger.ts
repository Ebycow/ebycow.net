import $ from 'jquery';
import moment from 'moment';

//images
const summer = require('./images/img2.jpg');
const swimsuit = require('./images/img3.jpg');
const sub = require('./images/img4').img;

let img: any | undefined = undefined;

const month: number = parseInt(moment().format('MM'));
if(month >= 6 && month <= 10){
    img = summer;

}

const rnd: number = Math.random();
if(rnd < 0.01){
    img = swimsuit;

}

if(img !== undefined) {
    $('.neko').css({
        'background-image' : `url(${img})`

    });

}


setTimeout(() => {
    if(rnd < 0.001){
        $('.neko').css({
            'background-image' : `url(${sub})`

        });

    }

}, 600000);

console.log("a");