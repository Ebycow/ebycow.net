// html
import './index.html';

// styles
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import './styles/style.css';

// fonts


// scripts
import 'bootstrap';
import $ from 'jquery';
import './bgchanger';

// tooltip
$(() => {
    $('[data-toggle="tooltip"]').tooltip();

});
