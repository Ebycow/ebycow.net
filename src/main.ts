// html
import './index.html';

// styles
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import './styles/style.css';

// fonts
import './styles/googlefonts.css';

// scripts
import 'bootstrap';

import $ from 'jquery';41

$(() => {
    $('[data-toggle="tooltip"]').tooltip()

});
