'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _withAuth = require('./with-auth');

var _withAuth2 = _interopRequireDefault(_withAuth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RenderWrapper = function (_React$Component) {
    _inherits(RenderWrapper, _React$Component);

    function RenderWrapper(props) {
        _classCallCheck(this, RenderWrapper);

        var _this = _possibleConstructorReturn(this, (RenderWrapper.__proto__ || Object.getPrototypeOf(RenderWrapper)).call(this, props));

        _this.checkAuth();
        return _this;
    }

    _createClass(RenderWrapper, [{
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.checkAuth();
        }
    }, {
        key: 'checkAuth',
        value: function checkAuth() {
            var _props$auth = this.props.auth,
                loggedIn = _props$auth.loggedIn,
                login = _props$auth.login;


            if (!loggedIn) {
                login(this.props.path);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            if (!this.props.auth.loggedIn) {
                return null;
            }

            var C = this.props.component;
            return this.props.render ? this.props.render(this.props.renderProps) : _react2.default.createElement(C, this.props.renderProps);
        }
    }]);

    return RenderWrapper;
}(_react2.default.Component);

var SecureRoute = function (_React$Component2) {
    _inherits(SecureRoute, _React$Component2);

    function SecureRoute() {
        _classCallCheck(this, SecureRoute);

        return _possibleConstructorReturn(this, (SecureRoute.__proto__ || Object.getPrototypeOf(SecureRoute)).apply(this, arguments));
    }

    _createClass(SecureRoute, [{
        key: 'createRenderWrapper',
        value: function createRenderWrapper(renderProps) {
            return _react2.default.createElement(RenderWrapper, {
                renderProps: renderProps,
                component: this.props.component,
                render: this.props.render,
                path: this.props.path,
                auth: this.props.auth
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            return _react2.default.createElement(_reactRouterDom.Route, {
                path: this.props.path,
                exact: this.props.exact,
                render: function render(props) {
                    return _this3.createRenderWrapper(props);
                }
            });
        }
    }]);

    return SecureRoute;
}(_react2.default.Component);

exports.default = (0, _reactRouterDom.withRouter)((0, _withAuth2.default)(SecureRoute));