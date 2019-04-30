'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _authContext = require('./auth-context');

var _authContext2 = _interopRequireDefault(_authContext);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var withAuth = function withAuth(Component) {
    var C = function C(props) {
        return _react2.default.createElement(
            _authContext2.default.Consumer,
            null,
            function (auth) {
                return _react2.default.createElement(Component, _extends({}, props, { auth: auth }));
            }
        );
    };

    C.displayName = 'withAuth(' + (Component.displayName || Component.name) + ')';

    return C;
};

exports.default = withAuth;