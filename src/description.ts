import $ from 'jquery';

const descElem = $('.description');
const defaultText = descElem.html();

let appendText: string = "";

descElem.on('animationend', (ev) => {
    const animationName = (<AnimationEvent>ev.originalEvent).animationName;
    if(animationName === 'falldown') {
        descElem.text(`#${appendText}`);
        
    }

});

$('.link-item').hover(
    // on
    (ev) => {
        appendText = ev.currentTarget.getAttribute('data-title') + "";
        descElem.toggleClass('link');
        descElem.toggleClass('default');

    },
    
    // out
    (ev) => {
        descElem.html(defaultText);
        descElem.toggleClass('link');
        descElem.toggleClass('default');

    }

);