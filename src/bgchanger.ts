import $ from 'jquery';
import moment from 'moment';
import CryptoJS from 'crypto-js';

const MAX_IMAGES = 102;

const random = Math.floor( Math.random() * MAX_IMAGES );
//images
const normal = require(`./images/${ random }.png`);

let img: any | undefined = normal;


if(img !== undefined) {
    $('.neko').css({
        'background-image' : `url(${img})`

    });

}

$('.neko').addClass('neko-fadeIn');

setInterval(() => {
    $('.neko').removeClass('neko-fadeIn');
    $('.neko').addClass('neko-fadeOut');



    setTimeout(() => {
        // TODO: 重複問題
        const random = Math.floor( Math.random() * MAX_IMAGES );
        //images
        const normal = require(`./images/${ random }.png`);

        let img: any | undefined = normal;


        if(img !== undefined) {
            $('.neko').css({
                'background-image' : `url(${img})`

            });

        }
        $('.neko').addClass('neko-fadeIn');
        $('.neko').removeClass('neko-fadeOut');
    }, 1000);


    

}, 8000)