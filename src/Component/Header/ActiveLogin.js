import React, {Component} from 'react';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default class ActiveLogin extends Component {

    static propTypes = {
        session: PropTypes.object.isRequired,
        updateSessionFlag: PropTypes.func.isRequired,
    };

    doLogout() {
        this.props.session.clear();
        this.props.updateSessionFlag();
        window.location.reload();
    }

    renderLogoutButton() {
        if (this.props.session.isActive()) {
            return (
                <div className="float-left">
                    <button className="btn btn-link btn-sm btn-logout" onClick={this.doLogout.bind(this)}>
                        <i className="fa fa-sign-out"/>
                        <FormattedMessage id="app.Session.Logout"/>
                    </button>
                    <Link to="/user/change-password">
                        <button className="btn btn-link btn-sm btn-password">
                            <i className="fa fa-edit"/>
                            <FormattedMessage id="app.ChangePassword.Submit"/>
                        </button>
                    </Link>
                </div>
            );
        }
    }

    render() {
        const user = this.props.session.getUser();

        return (
            <div className="activeLogin">
                <span className="float-right">
                    {this.renderLogoutButton()}
                    {user !== 'anonymous' && (
                        <span className="navuser float-right">
                            <i 
                                tabIndex={0}
                                className="fa fa-user" 
                                data-toggle="popover"
                                title="E-Mail"
                                data-content={this.props.session.getUser()}
                                data-placement="bottom"
                                data-trigger="focus"
                            />
                        </span>
                    )}
                </span>
            </div>
        );
    }
}
