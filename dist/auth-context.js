'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AuthContext = _react2.default.createContext({
    loggedIn: false,
    login: function login() {},
    logout: function logout() {},
    isAuthenticated: function isAuthenticated() {},
    handleAuthentication: function handleAuthentication() {},
    getAccessToken: function getAccessToken() {},
    getIdToken: function getIdToken() {},
    setSession: function setSession() {},
    renewSession: function renewSession() {}
});

exports.default = AuthContext;