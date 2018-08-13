import React, {Component} from 'react';
import axios from 'axios';
import {Link, Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

export default class DoLogin extends Component {

    static contextTypes = {
        intl: PropTypes.object.isRequired,
    };

    static propTypes = {
        isAuthenticated: PropTypes.bool.isRequired,
        api: PropTypes.string.isRequired,
        handleSession: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.email = React.createRef();
        this.password = React.createRef();

        this.state = {
            loginError: false,
            loginWithEmail: false,
            inactive: false,
        };
    }

    handleSubmit(e) {
        e.preventDefault();
        let email = unescape(encodeURIComponent(this.email.current.value));
        let password = unescape(encodeURIComponent(this.password.current.value));

        axios.post(this.props.api + '/login', {}, {
            headers: {
                'Authorization': 'Basic ' + btoa(email + ':' + password),
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json',
            },
        })
            .then((resp) => {
                if (resp.data.login_with_email) {
                    this.setState({
                        loginError: true,
                        loginWithEmail: true,
                    });
                } else {
                    this.props.handleSession(resp.data)
                }
            })
            .catch((err) => {
                if (err.response && err.response.headers && err.response.headers['x-error'] === 'inactive') {
                    this.setState({
                        inactive: true,
                    });
                }

                this.setState({ loginError: true });
            });
    }

    render() {
        const {from} = this.props.location.state || {from: {pathname: "/"}};
        const {reason} = this.props.location.state || '';
        let content;
        let pemail = this.context.intl.formatMessage({id: 'app.Login.Email'});
        let ppass = this.context.intl.formatMessage({id: 'app.Login.Password'});
        let login = this.context.intl.formatMessage({id: 'app.Login.Login'});
        let register = this.context.intl.formatMessage({id: 'app.Login.Register'});

        if (!this.props.isAuthenticated) {
            content = (
                <div className="loginForm">
                    <div className="login-pic"/>

                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <h1 className="modal-title">Login JTL-OneTimeLink</h1>

                        {reason === 'PROTECTED_LINK' && (
                            <div className="alert alert-warning">
                                <FormattedMessage id="app.Login.additional.reason.PROTECTED_LINK" /><br />
                            </div>
                        )}

                        <div className="form-group">
                            <input className="form-control" placeholder={pemail} id="loginEmail" type="text"
                                   ref={this.email}/>
                        </div>
                        <div className="form-group">
                            <input className="form-control" placeholder={ppass} id="loginPassword"
                                   type="password"
                                   ref={this.password}/>
                        </div>

                        <Link to="/password-reset">
                            <FormattedMessage
                                id="app.PasswordReset.Forgot"
                            />
                        </Link>

                        {this.state.loginError && this.state.loginWithEmail && (
                            <div className = "text-danger" >
                                <FormattedMessage
                                    id="app.Login.LoginWithEmail"
                                />
                            </div>
                        )}

                        {this.state.loginError && this.state.inactive && (
                            <div className="text-danger">
                                <FormattedMessage
                                    id="app.Login.AccountInactive"
                                />
                            </div>
                        )}

                        {this.state.loginError && !this.state.inactive && !this.state.loginWithEmail && (
                            <div className="text-danger">
                                <FormattedMessage
                                    id="app.Login.Failure"
                                />
                            </div>
                        )}
                        <br />

                        {(reason === '' || reason === undefined) && (
                            <div>
                                <FormattedMessage id="app.Login.Help" /><br /><br />
                                <FormattedMessage id="app.Login.Help.delete" /><br />
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary mt-5">{login}</button>
                        <Link to="/register">
                            <button className="btn btn-primary mr-2 mt-5">{register}</button>
                        </Link>
                    </form>
                </div>
            );
        }
        else {
            return <Redirect to={from}/>;
        }
        return (<div className="DoLogin">{content}</div>);
    }
}