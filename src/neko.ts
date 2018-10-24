import * as PIXI from 'pixi.js';
import $ from 'jquery';

// images
const leftImage : string = require('./images/left-img.png');
const bgImage : string = require('./images/p_da0341_l_da03410.jpg');

PIXI.utils.sayHello(PIXI.utils.isWebGLSupported() ? "WebGL" : "canvas");

var app = new PIXI.Application(
    {
        width: $('.chara-col').width() ,
        height: 1200,

        antialias: true,
        transparent: true,
        resolution: 2
    }
);

app.renderer.autoResize = true;
// app.renderer.view.style['touch-action'] = 'auto';
app.renderer.plugins.interaction.autoPreventDefault = false;

$('.chara-disp').append(app.view);

let imgNum = 0;

if(Math.random() <= 0.002){
    imgNum = 1;
}

PIXI.loader
.add("neko", leftImage)
.add("bg" , bgImage)
.load(init);
        
var neko : PIXI.Sprite;
var bg : PIXI.extras.TilingSprite;

// フレームカウンタ
var pos = 0;

var offset = 0.6;
var speed = 0.01;
var range = 0.01;

var clicked = 0;
var countClick = 0;
var scrollCount : any = $(window).scrollTop();

var fadeIn = 1;


function init(){

    bg = new PIXI.extras.TilingSprite(PIXI.loader.resources["bg"].texture, app.screen.width, app.screen.height);
    
    var blurFilter = new PIXI.filters.BlurFilter();
    blurFilter.blur = 2;
    bg.filters = [blurFilter];

    app.stage.addChild(bg);

    neko = new PIXI.Sprite(PIXI.loader.resources["neko"].texture);
    neko.interactive = true;
    neko.buttonMode = false;

    neko.anchor.set(0.5);         
    app.stage.addChild(neko);

    neko.on('pointerdown', onClickNyanNyan);

    neko.x = app.screen.width / 2;

    app.ticker.add(delta => gameLoop(delta));

}

        


function onClickNyanNyan (ev : any) {
    countClick++;
    if(countClick > 4) {
        var x = ev.data.originalEvent.offsetX;
        var y = ev.data.originalEvent.offsetY;

        if(y >= 10 && y < 100){
            $('.comment').text("耳触んのもやめろや。");

        } else if(y >= 300 && y < 400 || y >= 600 && y < 700){
            $('.comment').text("……。");

        } else {
            $('.comment').text("さっきから好き勝手に触ってんじゃねーぞ。");
        }
        
    }

    clicked = 20;
    
}

$(window).on('scroll', function() {
    scrollCount = $(window).scrollTop();
});

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

function gameLoop(delta : number){
    pos += delta;

    // フェードイン
    if(fadeIn >= 0){                
        fadeIn -= 0.05;
        neko.alpha = 1 + -fadeIn;
        bg.alpha = 0.3 + -fadeIn;
    }

    neko.y = app.screen.height / 2 - scrollCount * 0.5;

    bg.tilePosition.x = pos * 0.4;
    bg.tilePosition.y = pos * 0.4;

    // ブレス
    neko.scale.x = offset + Math.sin( pos * speed ) * range;
    neko.scale.y = offset + Math.sin( pos * speed ) * range;

    //クリック
    if(clicked > 0){
        neko.x += Math.sin( clicked ) * (clicked * 0.1);
        clicked--;
    }

}
