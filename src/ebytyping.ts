import $ from 'jquery';
// ebytype

// se
const audioPi = require('./audios/pi.wav');
const audioBoo = require('./audios/boo.wav');
const audioEnd = require('./audios/end.wav');

// AudioElementはキー押下時遅延ロードするのでこの時点では仮
const se = {
    pi : <HTMLAudioElement>$('#soundpi')[0],
    boo : <HTMLAudioElement>$('#soundboo')[0],
    end : <HTMLAudioElement>$('#soundend')[0]
}

let firstAttack = true;

let start = true;
let timer = 30;

let interval: number | undefined = undefined;

let word = 'ebycow';
let keyPosition = 0;

let colorTable: number[] = [];
for (const ebi of word) {
    colorTable.push(Math.random() * 360);
    
}

let score = 0;
let miss = 0;

const dict = [
    "osakana", "kanikama", "oishi", "nekosan", 
    "saikyou", "rakuraku", "eraine", "ebikau", 
    "sakusaku", "wakuwaku", "kakukaku", "zakuzaku",
    "ebycow", "umyaa", "nekochan", "uooooo",
    "daisuki", "ikayaki", "takoyaki", "yakisoba",

]

$('body').on('keydown.typing', (ev) => {
    if(ev.key){

        if(firstAttack) {

            // seの遅延ロード
            $('body').append(`<audio id="soundpi" preload="auto"><source src="${ audioPi }" type="audio/wav"></audio>`)
            $('body').append(`<audio id="soundboo" preload="auto"><source src="${ audioBoo }" type="audio/wav"></audio>`)
            $('body').append(`<audio id="soundend" preload="auto"><source src="${ audioEnd }" type="audio/wav"></audio>`)

            se.pi = <HTMLAudioElement>$('#soundpi')[0];
            se.boo = <HTMLAudioElement>$('#soundboo')[0];
            se.end = <HTMLAudioElement>$('#soundend')[0];

            firstAttack = false;

        }

        // console.log(EBYCOW.slice(ebycowPosition, ebycowPosition + 1)[0])
        const nextKey = word.slice(keyPosition, keyPosition + 1)[0]
        if(ev.key === nextKey) {

            let html = "";

            for (let i = 0; i <= keyPosition; i++) {
                let txt = word.slice(i, i + 1)[0]

                if(i === 0) {
                    txt = txt.toUpperCase();
                }

                const styleWriting = `style='color: hsl(${ colorTable[i] }, 80%, 75%); ${ i == keyPosition ? "animation: fadeIn 1s ease 0s 1 normal;" : "" }'`
                html += `<span ${styleWriting}>${ txt }</span>`;

            }

            html += word.slice(keyPosition + 1, word.length);

            $('h1').html(html);

            keyPosition++;

            // 最初の "ebycow" をタイプ数から無視
            if(!start){
                score++;
            }


            if(keyPosition >= word.length) {
                word = dict[Math.floor(Math.random() * dict.length)];
                keyPosition = 0;
                colorTable = [];

                for (const ebi of word) {
                    colorTable.push(Math.random() * 360);

                }

                $('h1').html(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
                
                if(start){
                    interval = window.setInterval(() => {
                        timer--;
                        $('.description').text(`Time: ${timer}`);

                        // finish
                        if(timer <= 0) {
                            clearInterval(interval);
                            $('h1').html("Finish!");
                            $('.description').html(`Score: ${score} Miss: ${miss} <a href="https://twitter.com/intent/tweet?text=aimu geined ${score} point${ score > 1 ? "s" : ""} in ebytyping! I amu saikyou!!!!! https://ebycow.net">Tyuweet</a>`);
                            
                            // リセットは再読み込みでよいので簡単のためイベントを切る
                            $('body').off('keydown.typing')

                            se.end.currentTime = 0;
                            se.end.play();
                        }

                    }, 1000);

                    start = false;

                }

            }

            se.pi.currentTime = 0;
            se.pi.play();

        } else {
            if(!start) {
                miss++;

                let html = "";

                for (let i = 0; i <= keyPosition; i++) {
                    let txt = word.slice(i, i + 1)[0]
    
                    if(i === 0) {
                        txt = txt.toUpperCase();
                    }
    
                    const styleWriting = `style="color: ${ i === keyPosition ? "red" : "pink" }; display: inline-block; animation: hurueru .1s ease 0s 1 normal"`
                    html += `<span ${styleWriting}>${ txt }</span>`;
    
                }
    
                html += word.slice(keyPosition + 1, word.length);
                $('h1').html(html);

                se.boo.currentTime = 0;
                se.boo.play();

            }
    
        }

    }

});

// このリセットは完璧に実装されているが、再読み込みで十分なのであった

// $('h1').on('click', () => {
//     start = true;
//     timer = 30;

//     clearInterval(interval)

//     word = "ebycow";
//     keyPosition = 0;

//     colorTable = [];

//     for (const ebi of word) {
//         colorTable.push(Math.random() * 360);

//     }

//     score = 0;

//     $('h1').html("Ebycow");
    
// });