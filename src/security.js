import React from 'react';
import { withRouter } from 'react-router-dom';

import auth0 from 'auth0-js';
import AuthContext from './auth-context';
import { setCookie } from './utils/set-cookie';

class Security extends React.Component {

    constructor(props) {
        super(props);

        this.accessToken = null;
        this.idToken = null;
        this.expiresAt = null;
        this.profile = null;
        
        const { domain, clientID, redirectUri } = props;

        this.auth0 = new auth0.WebAuth({
            domain,
            clientID,
            redirectUri,
            responseType: 'token id_token',
            scope: 'openid'
        });

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

        this.auth0.authorize();
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

        // // Remove isLoggedIn flag from localStorage
        localStorage.removeItem('isLoggedIn');
        setCookie('signed_in', false, -10); // negative amount to expire instantly

        const returnTo = encodeURIComponent(this.props.appDomain + '/loggedout');
        window.location.href = `https://${this.props.domain}/v2/logout?returnTo=${returnTo}`;
    }

    handleAuthentication() {
        return new Promise((resolve, reject) => {
            this.auth0.parseHash((err, authResult) => {
                if (authResult && authResult.accessToken && authResult.idToken) {
                    resolve(this.setSession(authResult));
                } else {
                    reject(err);
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
        // Set isLoggedIn flag in localStorage
        localStorage.setItem('isLoggedIn', 'true');
        
        // TODO: set skift_usr cookie so it expires with the JWT
        setCookie('skift_usr', authResult.idToken, 60*60*24*30);
        setCookie('signed_in', true, 60*60*24*30);

        // Set the time that the access token will expire at
        let expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
        this.accessToken = authResult.accessToken;
        this.idToken = authResult.idToken;
        this.profile = (authResult.idTokenPayload || {})['https://my.skift.com/profile'];
        this.expiresAt = expiresAt;

        if (this.props.tokenCallback && typeof this.props.tokenCallback === 'function') {
            // add the token to the redux store and axios headers
            this.props.tokenCallback(this.idToken);
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
                this.auth0.checkSession({}, (err, authResult) => {
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
    