'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRouterDom = require('react-router-dom');

var _auth0Js = require('auth0-js');

var _auth0Js2 = _interopRequireDefault(_auth0Js);

var _authContext = require('./auth-context');

var _authContext2 = _interopRequireDefault(_authContext);

var _setCookie = require('./utils/set-cookie');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Security = function (_React$Component) {
    _inherits(Security, _React$Component);

    function Security(props) {
        _classCallCheck(this, Security);

        var _this = _possibleConstructorReturn(this, (Security.__proto__ || Object.getPrototypeOf(Security)).call(this, props));

        _this.accessToken = null;
        _this.idToken = null;
        _this.expiresAt = null;
        _this.profile = null;

        var domain = props.domain,
            clientID = props.clientID,
            redirectUri = props.redirectUri;


        _this.auth0 = new _auth0Js2.default.WebAuth({
            domain: domain,
            clientID: clientID,
            redirectUri: redirectUri,
            responseType: 'token id_token',
            scope: 'openid offline_access'
        });

        _this.state = {
            authChecked: false,
            loggedIn: false,
            profile: null,
            login: function login(redirect) {
                return _this.login(redirect);
            },
            logout: function logout(redirect) {
                return _this.logout(redirect);
            },
            isAuthenticated: function isAuthenticated() {
                return _this.isAuthenticated();
            },
            handleAuthentication: function handleAuthentication() {
                return _this.handleAuthentication();
            },
            getAccessToken: function getAccessToken() {
                return _this.getAccessToken();
            },
            getIdToken: function getIdToken() {
                return _this.getIdToken();
            },
            setSession: function setSession(authResult) {
                return _this.setSession(authResult);
            },
            renewSession: function renewSession() {
                return _this.renewSession();
            }
        };

        _this.renewSession().then(function () {
            return _this.setState({ authChecked: true });
        }).catch(function (err) {
            return _this.setState({ err: err });
        });
        return _this;
    }

    _createClass(Security, [{
        key: 'login',
        value: function login(redirect) {
            if (redirect) {
                localStorage.setItem('loginRedirect', redirect);
            }

            this.auth0.authorize();
        }
    }, {
        key: 'logout',
        value: function logout(redirect) {
            if (redirect) {
                localStorage.setItem('logoutRedirect', redirect);
            }

            // // Remove tokens and expiry time
            this.accessToken = null;
            this.profile = null;
            this.idToken = null;
            this.expiresAt = 0;

            // // Remove isLoggedIn flag from localStorage
            localStorage.removeItem('isLoggedIn');
            (0, _setCookie.setCookie)('signed_in', false, -10); // negative amount to expire instantly

            var returnTo = encodeURIComponent(this.props.appDomain + '/loggedout');
            window.location.href = 'https://' + this.props.domain + '/v2/logout?returnTo=' + returnTo;
        }
    }, {
        key: 'handleAuthentication',
        value: function handleAuthentication() {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                _this2.auth0.parseHash(function (err, authResult) {
                    if (authResult && authResult.accessToken && authResult.idToken) {
                        resolve(_this2.setSession(authResult));
                    } else {
                        reject(err);
                    }
                });
            });
        }
    }, {
        key: 'getAccessToken',
        value: function getAccessToken() {
            return this.accessToken;
        }
    }, {
        key: 'getIdToken',
        value: function getIdToken() {
            return this.idToken;
        }
    }, {
        key: 'setSession',
        value: function setSession(authResult) {
            console.log('authResult', authResult);
            // Set isLoggedIn flag in localStorage
            localStorage.setItem('isLoggedIn', 'true');

            // TODO: set skift_usr cookie so it expires with the JWT
            (0, _setCookie.setCookie)('skift_usr', authResult.idToken, 60 * 60 * 24 * 30);
            (0, _setCookie.setCookie)('signed_in', true, 60 * 60 * 24 * 30);

            // Set the time that the access token will expire at
            var expiresAt = authResult.expiresIn * 1000 + new Date().getTime();
            this.accessToken = authResult.accessToken;
            this.idToken = authResult.idToken;
            this.profile = authResult.idTokenPayload && authResult.idTokenPayload['https://my.skift.com/profile'];
            this.expiresAt = expiresAt;

            if (this.props.tokenCallback && typeof this.props.tokenCallback === 'function') {
                // add the token to the redux store and axios headers
                this.props.tokenCallback(this.idToken);
            }

            if (this.props.profileCallback && typeof this.props.profileCallback === 'function' && this.profile) {
                this.props.profileCallback(this.profile);
            }

            this.setState({ loggedIn: true, profile: this.profile });

            var redirect = localStorage.getItem('loginRedirect');
            if (redirect) {
                localStorage.removeItem('loginRedirect', redirect);

                if (redirect.indexOf('http') !== -1) {
                    window.location.href = redirect;
                } else {
                    this.props.history.replace(redirect);
                }

                return _extends({
                    redirected: true
                }, authResult);
            }

            return authResult;
        }
    }, {
        key: 'renewSession',
        value: function renewSession() {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                if (localStorage.getItem('isLoggedIn') === 'true') {
                    _this3.auth0.checkSession({}, function (err, authResult) {
                        if (authResult && authResult.accessToken && authResult.idToken) {
                            _this3.setSession(authResult);
                            resolve(authResult);
                        } else if (err) {
                            _this3.logout();
                            // alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
                            reject(err);
                        }
                    });
                } else {
                    resolve(null);
                }
            });
        }
    }, {
        key: 'isAuthenticated',
        value: function isAuthenticated() {
            // Check whether the current time is past the
            // access token's expiry time
            var expiresAt = this.expiresAt;
            return new Date().getTime() < expiresAt;
        }
    }, {
        key: 'getUserId',
        value: function getUserId() {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                if (localStorage.getItem('isLoggedIn') === 'true') {
                    _this4.auth0.client.userInfo(_this4.accessToken, function (err, user) {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(user.sub);
                    });
                } else {
                    reject(null);
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _state = this.state,
                authChecked = _state.authChecked,
                err = _state.err,
                auth = _objectWithoutProperties(_state, ['authChecked', 'err']);

            var _props = this.props,
                SignInLoader = _props.SignInLoader,
                SignInErrorMessage = _props.SignInErrorMessage;


            if (!authChecked) {
                if (SignInLoader) {
                    return _react2.default.createElement(SignInLoader, null);
                }

                return _react2.default.createElement(
                    'div',
                    null,
                    'Singing In'
                );
            }

            if (err) {
                if (SignInErrorMessage) {
                    return _react2.default.createElement(SignInErrorMessage, { err: err });
                }

                return _react2.default.createElement(
                    'div',
                    null,
                    'An error occured while signing in'
                );
            }

            return _react2.default.createElement(
                _authContext2.default.Provider,
                { value: auth },
                _react2.default.createElement(
                    'div',
                    { className: this.props.className },
                    this.props.children
                )
            );
        }
    }]);

    return Security;
}(_react2.default.Component);

exports.default = (0, _reactRouterDom.withRouter)(Security);