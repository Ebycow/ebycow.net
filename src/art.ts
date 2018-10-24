import $ from 'jquery';

const image1 = require('./images/right-img.png');
const image2 = require('./images/right-img2.png');
const image3 = require('./images/right-img3.png');

$('#faces').append($('<img>').attr("src", image1).css(
    {
        "position": "absolute",
        "left": "10%",
        "height": "100%",
    }
));

$('#faces').append($('<img>').attr("src", image2).css(
    {
        "position": "absolute",
        "right": "10%",
        "height": "50%",
    }
));

$('#faces').append($('<img>').attr("src", image3).css(
    {
        "position": "absolute",
        "right": "10%",
        "top": "50%",
        "height": "50%",
    }
));