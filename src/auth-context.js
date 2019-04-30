import React from 'react';

const AuthContext = React.createContext({
    loggedIn: false,
    login: () => {},
    logout: () => {},
    isAuthenticated: () => {},
    handleAuthentication: () => {},
    getAccessToken: () => {},
    getIdToken: () => {},
    setSession: () => {},
    renewSession: () => {}
});

export default AuthContext;