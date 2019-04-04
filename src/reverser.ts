import $ from 'jquery';

$(()=> {
    $('body, a').css({
        "transition" : "1s"
    });

});

$('h1, a').click(() => {
    console.log("a");
    $('body').toggleClass('reverse');
    $('a').toggleClass('link-reverse');

});