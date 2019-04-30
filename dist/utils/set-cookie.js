'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setCookie = setCookie;
function setCookie(name, val, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = 'expires=' + d.toUTCString();

    var host = window.location.hostname;
    var domain = host === 'localhost' ? 'localhost' : host.indexOf('skift.com') !== -1 ? '.skift.com' : '.wpengine.com';

    document.cookie = name + '=' + val + ';' + expires + ';path=/;domain=' + domain;
};