import $ from 'jquery';

const descElem = $('.description');
const defaultText = descElem.text();

$('.link-item').hover(
    // on
    (ev) => {
        const linkTx = ev.currentTarget.getAttribute('title');
        if(linkTx !== null){
            descElem.text(`#${linkTx}`).dequeue();

        }
        
        descElem.removeClass('description-default');
        descElem.addClass('description-link');

    },
    
    // out
    (ev) => {
        descElem.text(defaultText);

        descElem.removeClass('description-link');
        descElem.addClass('description-default');

    }

);