import $ from 'jquery';

const descElem = $('.description');
const defaultText = descElem.text();

let appendText: string = "";

descElem.on('animationend', (ev) => {
    const animationName: 'falldown' | 'scrolldown' | 'fallback' = ev.originalEvent.animationName;
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
        descElem.text(defaultText);
        descElem.toggleClass('link');
        descElem.toggleClass('default');

    }

);