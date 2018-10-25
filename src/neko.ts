import * as PIXI from 'pixi.js';
import $ from 'jquery';
import * as Rx from 'rxjs';
import { take, skip } from 'rxjs/operators';


// images
const images : string[] = [
    require('./images/left-img.png'),
    require('./images/oYbQ2ydeJYi6en8hqWDj.png'),
];
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

let img: string;
if(Math.random() <= 0.002){
    img = images[1];
} else {
    img = images[0];
}

PIXI.loader
.add("neko", img)
.add("bg" , bgImage)
.load(init);


// スプライト, フィルター
let neko : PIXI.Sprite;
let bg : PIXI.extras.TilingSprite;

let blurFilter : PIXI.filters.BlurFilter;

// windowイベント
const windowScrollObservable = Rx.fromEvent(window, 'scroll');
const windowResizeObservable = Rx.fromEvent(window, 'resize');

// カウンタ
var pos = 0;
var quake = 0;

windowResizeObservable.subscribe(() => {
    app.renderer.resize($('.chara-col').width()! , 1200);
});

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

    const nekoClickObservable : Rx.Observable<any> = Rx.fromEvent(neko, 'pointerdown');
    nekoClickObservable.subscribe(() => quake = 20);
    nekoClickObservable.pipe(skip(3)).subscribe(ev => nekoChangeMessage(ev));

    windowResizeObservable.subscribe(() => {
        bg.height = app.screen.height;
        bg.width = app.screen.width;
    
        neko.x = app.screen.width / 2;
        neko.y = app.screen.height / 2;
    });

    // 読み込み時フェードイン
    Rx.interval(10).pipe(take(100)).subscribe((value) => {
        const fader = value / 100;

        neko.alpha = fader;
        bg.alpha = fader - 0.5;
    });

    // パララックス？
    windowScrollObservable.subscribe(() => {
        neko.y = app.screen.height / 2 - $window.scrollTop()! * 0.5;
    });

    app.ticker.add(delta => gameLoop(delta));

}

function nekoChangeMessage(ev : any){
    const pointerEvent : PointerEvent = ev.data.originalEvent;

    const x : number = pointerEvent.offsetX;
    const y : number = pointerEvent.offsetY;

    if(y >= 10 && y < 100){
        $('.comment').text("耳触んのもやめろや。");

    } else if(y >= 300 && y < 400 || y >= 600 && y < 700){
        $('.comment').text("……。");

    } else {
        $('.comment').text("さっきから好き勝手に触ってんじゃねーぞ。");
    }


}

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
