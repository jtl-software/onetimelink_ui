import React, {Component} from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {FormattedMessage} from 'react-intl';
import ReactLoading from 'react-loading';
import {Link} from 'react-router-dom';

export default class Register extends Component {
    static propTypes = {
        api: PropTypes.string.isRequired,
        hash: PropTypes.string.isRequired,
    };

    static contextTypes = {
        intl: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.state = {
            loading: true,
            success: false,
        };
    }

    componentDidMount() {
        axios.post(this.props.api + '/user/activate/' + this.props.hash)
            .then((resp) => {
                this.setState({
                    loading: false,
                    success: true,
                });
            })
            .catch((err) => {
                this.setState({
                    loading: false,
                    success: false,
                });
            })
    }

    render() {
        if (this.state.loading) {
            return (
                <div className="container">
                    <div className="row mt-4">
                        <div className="col-2 offset-5">
                            <ReactLoading type="spinningBubbles" color="#26292c" height={128} width={128} />
                        </div>
                    </div>
                </div>
            );
        }

        if (this.state.success) {
            return (
                <div className="container">
                    <div className="row mt-4">
                        <div className="col-12 text-center">
                            <FormattedMessage id="app.Register.ActivationSuccess" />
                            <Link
                                to="/login"
                                className="ml-2"
                            >
                                <button className="btn btn-primary">
                                    <FormattedMessage id="app.Login.Login"/>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="container">
                    <div className="row mt-4">
                        <div className="col-12 text-center">
                            <FormattedMessage id="app.Register.ActivationFailed" />
                        </div>
                    </div>
                </div>
            );
        }
    }
}