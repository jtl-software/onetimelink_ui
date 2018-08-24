import React, {Component} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {FormattedMessage} from 'react-intl';

const ERROR_REASONS = {
    EMAIL_EXISTS: 1,
    EMAIL_NOT_WHITELISTED: 2,
};

export default class Register extends Component {
    static propTypes = {
        api: PropTypes.string.isRequired,
    };

    static contextTypes = {
        intl: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.state = {
            email: '',
            emailError: false,
            password: '',
            passwordError: false,
            repeatPassword: '',
            repeatPasswordError: false,
            success: false,
            submitted: false,
            submitError: false,
        };
    }

    onChange(e) {
        switch (e.target.id) {
            case 'register-email':
                this.setState({
                    email: e.target.value,
                    emailError: e.target.value === ''
                });
                break;
            case 'register-password':
                this.setState({
                    password: e.target.value,
                    passwordError: e.target.value === ''
                });
                break;
            case 'repeat-password':
                this.setState({
                    repeatPassword: e.target.value,
                    repeatPasswordError: e.target.value === ''
                });
                break;
            default:
                break;
        }
    }

    register() {
        let shouldAbort = false;

        if (this.state.email === '') {
            this.setState({ emailError: true });
            shouldAbort = true;
        }

        if (this.state.password === '') {
            this.setState({ passwordError: true });
            shouldAbort = true;
        }

        if (this.state.repeatPassword === '') {
            this.setState({ repeatPasswordError: true });
            shouldAbort = true;
        }

        if (this.state.password.legnth < 8 || this.state.password !== this.state.repeatPassword) {
            shouldAbort = true;
        }

        if (shouldAbort) {
            return;
        }

        this.setState({
            success: false,
            submitted: false,
        });

        axios.post(this.props.api + '/user/add', {
            password: this.state.password,
            email: this.state.email,
        })
            .then((resp) => {
                if (resp.status === 201) {
                    this.setState({
                        success: true,
                        submitted: true,
                    });
                }
            })
            .catch((err) => {
                let submitError = true;

                if (err.response) {
                    if (err.response.status === 403) {
                        submitError = ERROR_REASONS.EMAIL_NOT_WHITELISTED;
                    } else if (err.response.status === 400) {
                        if (err.response.data.error !== undefined) {
                            switch (err.response.data.error) {
                                case 1:
                                    submitError = ERROR_REASONS.EMAIL_EXISTS;
                                    break;
                                case 2:
                                    submitError = ERROR_REASONS.EMAIL_NOT_WHITELISTED;
                                    break;
                                default:
                                    submitError = true;
                                    break;
                            }
                        }
                    }
                }

                this.setState({
                    success: false,
                    submitted: true,
                    submitError,
                });
            })
    }

    render() {
        const register = this.context.intl.formatMessage({id: 'app.Login.Register'});

        if (this.state.success) {
            return (
                <div className="col-12">
                    <div className="registered-pic" />
                    <div className="text-center">
                        <FormattedMessage
                            id="app.Register.Success"
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="col-12">
                <form onSubmit={this.register.bind(this)}>
                    <div className="form-group">
                        <label htmlFor="register-email">
                            <FormattedMessage
                                id="app.Register.EmailLabel"
                            />
                            {this.state.emailError && (
                                <span className="text-danger inline-register-error">
                                    *<FormattedMessage
                                        id="app.Register.EmailRequired"
                                    />
                                </span>
                            )}
                        </label>
                        <input
                            id="register-email"
                            type="email"
                            className="form-control"
                            placeholder="someone@example.com"
                            value={this.state.email}
                            onChange={this.onChange.bind(this)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-password">
                            <FormattedMessage
                                id="app.Register.PasswordLabel"
                            />
                            {this.state.passwordError && (
                                <span className="text-danger inline-register-error">
                                    *<FormattedMessage
                                        id="app.Register.PasswordRequired"
                                    />
                                </span>
                            )}
                        </label>
                        <input
                            id="register-password"
                            type="password"
                            className="form-control"
                            value={this.state.password}
                            onChange={this.onChange.bind(this)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="repeat-password">
                            <FormattedMessage
                                id="app.Register.RepeatPasswordLabel"
                            />
                            {this.state.repeatPasswordError && (
                                <span className="text-danger inline-register-error">
                                    *<FormattedMessage
                                        id="app.Register.RepeatPasswordRequired"
                                    />
                                </span>
                            )}
                        </label>
                        <input
                            id="repeat-password"
                            type="password"
                            className="form-control"
                            value={this.state.repeatPassword}
                            onChange={this.onChange.bind(this)}
                        />
                    </div>

                    {this.state.password !== this.state.repeatPassword && (
                        <div className="text-danger">
                            <FormattedMessage
                                id="app.Register.PasswordsNotEqual"
                            />
                        </div>
                    )}

                    {this.state.password.length < 8 && this.state.password.length > 0 && (
                        <div className="text-danger">
                            <FormattedMessage
                                id="app.Register.PasswordTooShort"
                            />
                        </div>
                    )}

                    {this.state.submitted 
                        && !this.state.success 
                        && Object.values(ERROR_REASONS).includes(this.state.submitError) 
                        && (
                        <div className="text-danger">
                            <FormattedMessage
                                id={`app.Register.Failures.${this.state.submitError}`}
                            />
                        </div>
                    )}

                    {this.state.submitted
                        && !this.state.success
                        && !Object.values(ERROR_REASONS).includes(this.state.submitError)
                        && this.state.submitError === true
                        && (
                            <div className="text-danger">
                                <FormattedMessage
                                    id="app.Register.Failure"
                                />
                            </div>
                        )}

                    <div className="col-12 mt-2 pl-0">
                        <button type="submit" className="btn btn-primary mr-2">{register}</button>
                    </div>
                </form>
            </div>
        );
    }
}