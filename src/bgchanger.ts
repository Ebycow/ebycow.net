import $ from 'jquery';
import moment from 'moment';
import CryptoJS from 'crypto-js';


const random = Math.floor( Math.random() * 19 );
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
        const random = Math.floor( Math.random() * 19 );
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