import $ from 'jquery';
// ebytype

const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();

// se
const audioPi = require('./audios/pi.wav');
const audioBoo = require('./audios/boo.wav');
const audioEnd = require('./audios/end.wav');

async function fetchAndDecodeAudio(path: string): Promise<AudioBuffer> {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

async function playSound(audioBufferPromise: Promise<AudioBuffer>, pitch = 1) {
    const audioBuffer = await audioBufferPromise;
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = pitch;
    source.connect(audioContext.destination);
    source.start(0);
}

const se = {
    pi: fetchAndDecodeAudio(audioPi),
    boo: fetchAndDecodeAudio(audioBoo),
    end: fetchAndDecodeAudio(audioEnd),
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
    // eat
    "osakana", "kanikama", "ikayaki", "takoyaki", 
    "ramen", "soba", "pizza", "candy",
    "karaage", "pancake", "taiyaki", "saamon",
    "oishi", "nekosan", "matatabi", "goronyan",
    "saikyou", "rakuraku", "eraine", "ebikau", 
    "sakusaku", "wakuwaku", "kakukaku", "zakuzaku",
    "ebycow", "umyaa", "nekochan", "uooooo",
    "daisuki", "yakisoba", "peyoung", "gekikara",

]

$('body').on('keydown.typing', (ev) => {
    if(ev.key){

        if(firstAttack) {

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

                            playSound(se.end);
                        }

                    }, 1000);

                    start = false;

                }

            }

            playSound(se.pi, Math.random() * 1 + 0.5);

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

                playSound(se.boo);

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