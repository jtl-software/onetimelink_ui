import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default class ChangePassword extends Component {

    static propTypes = {
        getSessionToken: PropTypes.func.isRequired,
    };

    static contextTypes = {
        intl: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.state = {
            oldPassword: '',
            newPassword: '',
            submitted: false,
            success: false,
        }
    }

    onSubmit() {
        this.setState({
            success: false,
            submitted: false,
        });

        axios.post(this.props.api + '/user/update' + this.props.getSessionToken(), {
            oldPassword: this.state.oldPassword,
            newPassword: this.state.newPassword,
        })
            .then((resp) => {
                if (resp.status === 200) {
                    this.setState({
                        success: true,
                        submitted: true,
                    });
                }
            })
            .catch((err) => {
                this.setState({
                    success: false,
                    submitted: true,
                });
            })
    }

    onChange(e) {
        switch (e.target.id) {
            case 'old-password':
                this.setState({
                    oldPassword: e.target.value,
                });
                break;
            case 'new-password':
                this.setState({
                    newPassword: e.target.value,
                });
                break;
            default:
                break;
        }
    }

    render() {
        const changePassword = this.context.intl.formatMessage({ id: 'app.ChangePassword.Submit' });

        if (this.state.success) {
            return (
                <div className="col-12">
                    <div className="success-pic" />
                    <div className="text-center">
                        <FormattedMessage
                            id="app.ChangePassword.Success"
                        />
                    </div>
                    <div className="col-12 text-center mt-3">
                        <Link to="/">
                            <button className="btn btn-primary">
                                <FormattedMessage
                                    id="app.ChangePassword.GoBack"
                                />
                            </button>
                        </Link>
                    </div>
                </div>
            );
        }

        return (
            <div className="container">
                <div className="col-12">
                    <form onSubmit={this.onSubmit.bind(this)}>
                        <div className="form-group">
                            <label htmlFor="old-password">
                                <FormattedMessage
                                    id="app.ChangePassword.OldPassword"
                                />
                            </label>
                            <input
                                id="old-password"
                                type="password"
                                className="form-control"
                                value={this.state.oldPassword}
                                onChange={this.onChange.bind(this)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="new-password">
                                <FormattedMessage
                                    id="app.ChangePassword.NewPassword"
                                />
                            </label>
                            <input
                                id="new-password"
                                type="password"
                                className="form-control"
                                value={this.state.newPassword}
                                onChange={this.onChange.bind(this)}
                            />
                        </div>

                        {this.state.submitted && !this.state.success && (
                            <span className="text-danger">
                                <FormattedMessage
                                    id="app.ChangePassword.Failure"
                                />
                            </span>
                        )}

                        <div className="col-12 mt-4 pl-0">
                            <button type="submit" className="btn btn-primary mr-2">{changePassword}</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
