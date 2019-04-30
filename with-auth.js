import React from 'react';
import AuthContext from './auth-context';

const withAuth = Component => {
    const C = props => (
        <AuthContext.Consumer>
            {auth => (
                <Component {...props} auth={auth} />
            )}
        </AuthContext.Consumer>
    );

    C.displayName = `withAuth(${Component.displayName || Component.name})`;

    return C;
};

export default withAuth;
