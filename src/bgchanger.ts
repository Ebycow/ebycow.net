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

setInterval(() => {
    const random = Math.floor( Math.random() * 19 );
    //images
    const normal = require(`./images/${ random }.png`);

    let img: any | undefined = normal;

    $('.neko').fadeOut(1000, () => {
        if(img !== undefined) {
            $('.neko').css({
                'background-image' : `url(${img})`
    
            });
    
        }
    }).fadeIn()

}, 10000)