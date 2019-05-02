import React from 'react';
import { Route, withRouter } from 'react-router';
import withAuth from './with-auth';

class RenderWrapper extends React.Component {
    constructor(props) {
        super(props)
        this.checkAuth();
    }

    componentDidUpdate() {
        this.checkAuth();
    }

    checkAuth() {
        const { loggedIn, login } = this.props.auth;

        if (!loggedIn) {
            login(this.props.path);
        }
    }

    render() {
        if (!this.props.auth.loggedIn) {
            return null;
        }

        const C = this.props.component;
        return this.props.render ? this.props.render(this.props.renderProps) : <C {...this.props.renderProps} />;
    }
}

class SecureRoute extends React.Component {
    createRenderWrapper(renderProps) {
        return (
            <RenderWrapper
                renderProps={renderProps}
                component={this.props.component}
                render={this.props.render}
                path={this.props.path}
                auth={this.props.auth}
            />
        );
    }

    render() {
        return (
            <Route
                path={this.props.path}
                exact={this.props.exact}
                render={(props) => this.createRenderWrapper(props)}
            />
        );
    }
}

export default withRouter(withAuth(SecureRoute));
