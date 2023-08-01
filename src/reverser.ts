import $ from 'jquery';

$(() => {
    $('.contents, a').css({
        "transition" : "background-color 1s"
    });

});

$('h1, a').click(() => {
    $('.contents').toggleClass('reverse');
    $('a').toggleClass('link-reverse');

});