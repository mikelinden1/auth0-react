'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var loginRedirect = function loginRedirect(history) {
    if (!history) {
        console.error('Missing history parameter in loginRedirect');
        return;
    }

    var loginRedirect = localStorage.getItem('loginRedirect');
    if (loginRedirect) {
        localStorage.removeItem('loginRedirect');
        history.replace(loginRedirect);
    }
};

exports.default = loginRedirect;