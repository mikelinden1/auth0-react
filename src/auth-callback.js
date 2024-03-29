import React from 'react';
import { Redirect } from 'react-router-dom';
import withAuth from './with-auth'

class AuthCallback extends React.Component {
    constructor(props){
        super(props);
        this.state = { authenticated: false }
    }

    componentWillMount() {
        const { location, auth } = this.props;

        if (/access_token|id_token|error/.test(location.hash)) {
            auth.handleAuthentication().then(({ redirected }) => {
                if (!redirected) {
                    // if we already redirected don't setState becuase the component has been unmounted
                    this.setState({ authenticated: true });
                }
            }).catch(err => {
                const error = err.errorDescription || 'An unexpected error occured';
                this.setState({ error });
            });
        } else {
            this.setState({ error: 'Missing tokens' });
        }
    }

    render() {
        const { authenticated, error } = this.state;
        const { errorMsg, loader, routeRoot, auth } = this.props;


        if (authenticated) {
            const redirect = routeRoot ? routeRoot + '/' : '/';

            return <Redirect to={redirect} />;
        }

        if (error) {
            const ErrorMessage = errorMsg ? errorMsg : (props) => <div>{props.content}</div>;
            return <ErrorMessage header="An error occured" content={error} auth={auth} />;
        }

        const Loader = loader ? loader : () => <div>Logging in...</div>;
        return <Loader />;
    }
}

export default withAuth(AuthCallback);