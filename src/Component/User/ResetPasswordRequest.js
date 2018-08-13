import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import axios from 'axios';

export default class ResetPasswordRequest extends Component {

    static contextTypes = {
        intl: PropTypes.object.isRequired,
    };

    static propTypes = {
        api: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.state = {
            email: '',
            resetHash: '',
            success: false,
            submitted: false,
        };
    }

    handleSubmit(e) {
        e.preventDefault();

        axios.post(this.props.api + '/password-reset-request', {
            email: this.state.email
        }).then((resp) => {
            if (resp.data.reset_hash !== undefined) {
                this.setState({
                    success: true,
                    submitted: true,
                });
            }
        }).catch((err) => {
            this.setState({
                success: false,
                submitted: true,
            });
        });
    }

    handleEmailChange(e) {
        this.setState({
            email: e.target.value,
        });
    }

    render() {
        const resetForm = (
            <div className="col-12 password-reset-form">
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <div className="form-group">
                        <label htmlFor="email-input">
                            <FormattedMessage id="app.PasswordReset.EmailLabel" />
                        </label>
                        <input
                            id="email-input"
                            value={this.state.email}
                            className="form-control"
                            type="email"
                            onChange={this.handleEmailChange.bind(this)}
                        />
                    </div>

                    {this.state.submitted && !this.state.success && (
                        <div className="text-danger">
                            <FormattedMessage id="app.PasswordReset.CreateError" />
                        </div>
                    )}

                    <button
                        className="btn btn-primary mt-2"
                        type="submit"
                    >
                        <FormattedMessage id="app.PasswordReset.Submit" />
                    </button>
                </form>
            </div>
        );

        if (this.state.submitted && this.state.success) {
            return (
                <div className="col-12">
                    <div className="success-pic" />
                    <div className="text-center">
                        <FormattedMessage id="app.PasswordReset.CreatedSuccessfully" />
                    </div>
                </div>
            );
        }

        return resetForm;
    }
}