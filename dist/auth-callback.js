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

var AuthCallback = function (_React$Component) {
    _inherits(AuthCallback, _React$Component);

    function AuthCallback(props) {
        _classCallCheck(this, AuthCallback);

        var _this = _possibleConstructorReturn(this, (AuthCallback.__proto__ || Object.getPrototypeOf(AuthCallback)).call(this, props));

        _this.state = { authenticated: false };
        return _this;
    }

    _createClass(AuthCallback, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            var _this2 = this;

            var _props = this.props,
                location = _props.location,
                auth = _props.auth;


            if (/access_token|id_token|error/.test(location.hash)) {
                auth.handleAuthentication().then(function (_ref) {
                    var redirected = _ref.redirected;

                    if (!redirected) {
                        // if we already redirected don't setState becuase the component has been unmounted
                        _this2.setState({ authenticated: true });
                    }
                }).catch(function (err) {
                    var error = err.errorDescription || 'An unexpected error occured';
                    _this2.setState({ error: error });
                });
            } else {
                this.setState({ error: 'Missing tokens' });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _state = this.state,
                authenticated = _state.authenticated,
                error = _state.error;
            var _props2 = this.props,
                errorMsg = _props2.errorMsg,
                loader = _props2.loader;


            if (authenticated) {
                return _react2.default.createElement(_reactRouterDom.Redirect, { to: '/' });
            }

            if (error) {
                var ErrorMessage = errorMsg ? errorMsg : function (props) {
                    return _react2.default.createElement(
                        'div',
                        null,
                        props.content
                    );
                };
                return _react2.default.createElement(ErrorMessage, { header: 'An error occured', content: error });
            }

            var Loader = loader ? loader : function () {
                return _react2.default.createElement(
                    'div',
                    null,
                    'Logging in...'
                );
            };
            return _react2.default.createElement(Loader, null);
        }
    }]);

    return AuthCallback;
}(_react2.default.Component);

exports.default = (0, _withAuth2.default)(AuthCallback);