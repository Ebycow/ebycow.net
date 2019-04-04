import $ from 'jquery';

const descElem = $('.description');
const defaultText = descElem.text();

$('.link-item').hover(
    // on
    (ev) => {
        //console.log(ev.currentTarget.getAttribute('data-original-title') + "");
        const linkTx = ev.currentTarget.getAttribute('title');


        descElem.removeClass('description-default');
        
        descElem.addClass('description-link');

        if(linkTx !== null){
            descElem.delay(250).queue(() => {
                descElem.text(`#${linkTx}`).dequeue();

            });

        }


    },
    
    // out
    (ev) => {

        descElem.text(defaultText);
        descElem.removeClass('description-link');

        descElem.addClass('description-default');



    }

);