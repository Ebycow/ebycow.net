import $ from 'jquery';

$('h1').click(() => {
    console.log("a");
    $('body').toggleClass('reverse');
});