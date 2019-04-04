// html
import './index.html';

// styles
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import './styles/style.css';
import './styles/description.css';
import './styles/reverser.css';

// fonts
import '@fortawesome/fontawesome-free/js/all';


// scripts
import 'bootstrap';
import $ from 'jquery';
import './bgchanger';
import './description';
import './reverser';

// tooltip
$(() => {
    $('[data-toggle="tooltip"]').tooltip();

});
