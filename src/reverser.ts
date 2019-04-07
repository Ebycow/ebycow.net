import $ from 'jquery';

$(() => {
    $('.contents, a').css({
        "transition" : "1s"
    });

});

$('h1, a').click(() => {
    $('.contents').toggleClass('reverse');
    $('a').toggleClass('link-reverse');

});