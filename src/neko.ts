import * as PIXI from 'pixi.js';
import $ from 'jquery';
import * as Rx from 'rxjs';
import { of } from 'rxjs';
import { scan, map, mapTo, take, takeLast } from 'rxjs/operators';


// images
const leftImage : string = require('./images/left-img.png');
const bgImage : string = require('./images/p_da0341_l_da03410.jpg');

const $window = $(window);

PIXI.utils.sayHello(PIXI.utils.isWebGLSupported() ? "WebGL" : "canvas");

const app = new PIXI.Application(
    {
        width: $('.chara-col').width() ,
        height: 1200,

        antialias: true,
        transparent: true,
        resolution: 2
    }
);

app.renderer.autoResize = true;
app.renderer.view.style.touchAction = 'auto';
app.renderer.plugins.interaction.autoPreventDefault = false;

$('.chara-disp').append(app.view);

// let imgNum = 0;

// if(Math.random() <= 0.002){
//     imgNum = 1;
// }

PIXI.loader
.add("neko", leftImage)
.add("bg" , bgImage)
.load(init);


// スプライト, フィルター
let neko : PIXI.Sprite;
let bg : PIXI.extras.TilingSprite;

let blurFilter : PIXI.filters.BlurFilter;



var scrollCount: any = $window.scrollTop();
const scrollObservable = Rx.fromEvent(window, 'scroll');
scrollObservable.subscribe(() => {
    scrollCount = $window.scrollTop();
});

// フレームカウンタ
var pos = 0;
var quake = 0;

function init(){

    bg = new PIXI.extras.TilingSprite(PIXI.loader.resources["bg"].texture, app.screen.width, app.screen.height);
    bg.alpha = 0;
    
    blurFilter = new PIXI.filters.BlurFilter();
    blurFilter.blur = 2;

    bg.filters = [blurFilter];

    app.stage.addChild(bg);

    neko = new PIXI.Sprite(PIXI.loader.resources["neko"].texture);
    neko.alpha = 0;
    neko.x = app.screen.width / 2;
    neko.y = app.screen.height / 2;
    neko.interactive = true;
    neko.buttonMode = false;

    neko.anchor.set(0.5);         
    app.stage.addChild(neko);

    // ねこいべんと
    const nekoClickObservable : Rx.Observable<any> = Rx.fromEvent(neko, 'pointerdown');
    const nekoClickCountObservable = nekoClickObservable.pipe(mapTo(0)).pipe(scan(count => count + 1, 0));

    // 揺らす
    nekoClickCountObservable.subscribe(() => quake = 20);
    // セリフ変える
    Rx.combineLatest(nekoClickCountObservable, nekoClickObservable).subscribe(value => nekoClickedSpeaker(value));

    // フェードイン
    Rx.interval(10).pipe(take(100)).subscribe((value) => {
        const fader = value / 100;

        neko.alpha = fader;
        bg.alpha = fader - 0.5;
    });

    // パララックス？
    scrollObservable.subscribe(() => {
        neko.y = app.screen.height / 2 - scrollCount * 0.5;
    });


    app.ticker.add(delta => gameLoop(delta));

}

function nekoClickedSpeaker(value: [number, any]){

    const [ countClick , ev ] = value;
    const pointerEvent : PointerEvent = ev.data.originalEvent;

    if(countClick > 4) {
        var x : number = pointerEvent.offsetX;
        var y : number = pointerEvent.offsetY;

        if(y >= 10 && y < 100){
            $('.comment').text("耳触んのもやめろや。");

        } else if(y >= 300 && y < 400 || y >= 600 && y < 700){
            $('.comment').text("……。");

        } else {
            $('.comment').text("さっきから好き勝手に触ってんじゃねーぞ。");
        }
        
    }

}




$(window).on('resize', function(){
    const charaCol = $('.chara-col').width();
    if(charaCol !== undefined){
        app.renderer.resize(charaCol , 1200);

    }
    

    bg.height = app.screen.height;
    bg.width = app.screen.width;

    neko.x = app.screen.width / 2;
    neko.y = app.screen.height / 2;

    
});




// 呼吸オプション
const offset = 0.6;
const speed = 0.01;
const range = 0.01;

function gameLoop(delta : number){
    pos += delta;

    // 背景スクロール
    bg.tilePosition.x = pos * 0.4;
    bg.tilePosition.y = pos * 0.4;

    // ねこブレス
    neko.scale.x = offset + Math.sin( pos * speed ) * range;
    neko.scale.y = offset + Math.sin( pos * speed ) * range;

    //クリック
    if(quake > 0){
        neko.x += Math.sin( quake ) * ( quake * 0.1 );
        quake--;
    }

}
