import $ from 'jquery';

$('.right-img').fadeOut(0).each(function (index, elem) {
    $(elem).fadeIn(1000 + index * 1000);
});
