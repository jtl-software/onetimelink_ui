import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ReactLoading from 'react-loading';
import axios from 'axios';

export default class ResetPasswordAction extends Component {

    static contextTypes = {
        intl: PropTypes.object.isRequired,
    };

    static propTypes = {
        api: PropTypes.string.isRequired,
        hash: PropTypes.string.isRequired,
    };

    componentDidMount() {
        axios.get(this.props.api + '/password-reset-check/' + this.props.hash)
            .then((resp) => {
                this.setState({
                    loading: false,
                    valid: resp.data.valid,
                    email: resp.data.email,
                });
            });
    }

    constructor() {
        super();

        this.state = {
            newPassword: '',
            email: '',
            valid: false,
            loading: true,
            submitted: false,
            success: false,
        };
    }

    handleSubmit(e) {
        e.preventDefault();

        axios.post(this.props.api + '/password-reset-action', {
            email: this.state.email,
            newPassword: this.state.newPassword,
        }).then((resp) => {
            if (resp.data.success) {
                this.setState({
                    submitted: true,
                    success: true,
                });
            }
        }).catch((err) => {
            this.setState({
                submitted: true,
                success: false,
            });
        });
    }

    handlePasswordChange(e) {
        this.setState({
            newPassword: e.target.value,
        });
    }

    render() {
        const loader = (
            <div className="container">
                <div className="row mt-4">
                    <div className="col-2 offset-5">
                        <ReactLoading type="spinningBubbles" color="#26292c" height={128} width={128} />
                    </div>
                </div>
            </div>
        );

        const inputForm = (
            <div className="col-12 password-reset-form">
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <div className="form-group">
                        <label htmlFor="new-password-input">
                            <FormattedMessage id="app.PasswordReset.NewPassword" />
                        </label>
                        <input
                            id="new-password-input"
                            value={this.state.newPassword}
                            className="form-control"
                            type="password"
                            onChange={this.handlePasswordChange.bind(this)}
                        />
                    </div>

                    {this.state.submitted && !this.state.success && (
                        <div className="text-danger">
                            <FormattedMessage id="app.PasswordReset.ResetError" />
                        </div>
                    )}

                    <button
                        className="btn btn-primary mt-2"
                        type="submit"
                    >
                        submit
                    </button>
                </form>
            </div>
        );

        if (this.state.submitted && this.state.success) {
            return (
                <div className="col-12">
                    <div className="success-pic" />
                    <div className="text-center">
                        <FormattedMessage id="app.PasswordReset.ResetSuccessfully" />
                    </div>
                </div>
            );
        }

        if (this.state.valid && !this.state.loading) {
            return inputForm;
        }

        return loader;
    }
}