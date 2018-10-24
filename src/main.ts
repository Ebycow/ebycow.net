// styles
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import './styles/style.css';

// fonts
import './styles/googlefonts.css';

// scripts
import $ from 'jquery';
import 'bootstrap';

import './neko.ts';


$('.right-img').fadeOut(0).each(function (index, elem) {
    $(elem).fadeIn(1000 + index * 1000);
});