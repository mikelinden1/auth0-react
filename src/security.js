import React from 'react';
import { withRouter } from 'react-router-dom';

import auth0 from 'auth0-js';
import AuthContext from './auth-context';
import uniqid from 'uniqid';

class Security extends React.Component {
    constructor(props) {
        super(props);

        this.accessToken = null;
        this.idToken = null;
        this.expiresAt = null;
        this.profile = null;
        this.renewSessionTimer = null;
        
        const { domain, clientID, redirectUri, audience } = props;

        const auth0Config = {
            domain,
            clientID,
            redirectUri,
            responseType: 'token id_token',
            scope: 'openid'
        };

        if (audience) {
            auth0Config.audience = audience;
        }

        this.auth0 = new auth0.WebAuth(auth0Config);

        this.state = {
            authChecked: false,
            loggedIn: false,
            profile: null,
            login: (redirect) => this.login(redirect),
            logout: (redirect) => this.logout(redirect),
            isAuthenticated: () => this.isAuthenticated(),
            handleAuthentication: () => this.handleAuthentication(),
            getAccessToken: () => this.getAccessToken(),
            getIdToken: () => this.getIdToken(),
            setSession: (authResult) => this.setSession(authResult),
            renewSession: () => this.renewSession()
        };

        this.renewSession()
            .then(() => this.setState({ authChecked: true }))
            .catch((err) => this.setState({ err }));
    }

    login(redirect) {
        if (redirect) {
            localStorage.setItem('loginRedirect', redirect);
        }

        const state = this.setAppState();
        this.auth0.authorize({ state });
    }

    logout(redirect) {
        if (redirect) {
            localStorage.setItem('logoutRedirect', redirect);
        }

        // // Remove tokens and expiry time
        this.accessToken = null;
        this.profile = null;
        this.idToken = null;
        this.expiresAt = 0;

        clearTimeout(this.renewSessionTimer);

        // // Remove isLoggedIn flag from localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('state');

        const returnTo = encodeURIComponent(this.props.appDomain + '/loggedout');
        window.location.href = `https://${this.props.domain}/v2/logout?returnTo=${returnTo}`;
    }

    handleAuthentication() {
        return new Promise((resolve, reject) => {
            if (this.state.loggedIn) {
                return resolve({});
            }

            this.auth0.parseHash((err, authResult) => {
                if (authResult && authResult.accessToken && authResult.idToken) {
                    resolve(this.setSession(authResult));
                } else {
                    reject(err);

                    if (err.error === 'invalid_token') {
                        this.login();
                    }
                }
            });
        });
    }

    getAccessToken() {
        return this.accessToken;
    }

    getIdToken() {
        return this.idToken;
    }

    setSession(authResult) { 
        const state = localStorage.getItem('state');

        if (authResult.state !== state) {
            // mitigate CSRF attacks
            this.logout();
            return;
        }

        // Set isLoggedIn flag in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        
        // Set the time that the access token will expire at
        const now = new Date().getTime();
        const expiresAt = (authResult.expiresIn * 1000) + now;
        this.accessToken = authResult.accessToken;
        this.idToken = authResult.idToken;
        this.profile = authResult.idTokenPayload && authResult.idTokenPayload['https://my.skift.com/profile'];
        this.expiresAt = expiresAt;

        const sessionRenewTime = 30*60*1000; // 30 minutes        
        clearTimeout(this.renewSessionTimer);
        this.renewSessionTimer = setTimeout(() => this.renewSession(), sessionRenewTime);

        if (this.props.tokenCallback && typeof this.props.tokenCallback === 'function') {
            // add the token to the redux store and axios headers
            this.props.tokenCallback({
                idToken: this.idToken,
                accessToken: this.accessToken
            });
        }

        if (this.props.profileCallback && typeof this.props.profileCallback === 'function' && this.profile) {
            this.props.profileCallback(this.profile);
        }

        this.setState({ loggedIn: true, profile: this.profile });

        const redirect = localStorage.getItem('loginRedirect');
        if (redirect) {
            localStorage.removeItem('loginRedirect', redirect);

            if (redirect.indexOf('http') !== -1) {
                window.location.href = redirect;
            } else {
                this.props.history.replace(redirect);
            }

            return { 
                redirected: true,
                ...authResult
            };
        }

        return authResult;
    }

    renewSession() {
        return new Promise((resolve, reject) => {
            if (localStorage.getItem('isLoggedIn') === 'true') {
                const state = this.setAppState();
                this.auth0.checkSession({ state }, (err, authResult) => {
                    if (authResult && authResult.accessToken && authResult.idToken) {
                        this.setSession(authResult);
                        resolve(authResult);
                    } else if (err) {
                        this.logout();
                        // alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
                        reject(err);
                    }
                });
            } else {
                resolve(null);
            }
        });
    }

    isAuthenticated() {
        // Check whether the current time is past the
        // access token's expiry time
        let expiresAt = this.expiresAt;
        return new Date().getTime() < expiresAt;
    }

    setAppState() {
        this.appState = uniqid();
        localStorage.setItem('state', this.appState);

        return this.appState;
    }

    getUserId() {
        return new Promise((resolve, reject) => {
            if (localStorage.getItem('isLoggedIn') === 'true') {
                this.auth0.client.userInfo(this.accessToken, function(err, user) {
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
    
    render() {
        const { authChecked, err, ...auth } = this.state;
        const { SignInLoader, SignInErrorMessage } = this.props;

        if (!authChecked) {
            if (SignInLoader) {
                return <SignInLoader />;
            }
            
            return <div>Singing In</div>;
        }

        if (err) {
            if (SignInErrorMessage) {
                return <SignInErrorMessage err={err} />;
            }
            
            return <div>An error occured while signing in</div>;
        }

        return (
            <AuthContext.Provider value={auth}>
                <div className={this.props.className}>
                    {this.props.children}
                </div>
            </AuthContext.Provider>
        );
    }
}
    
export default withRouter(Security);
    