import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import ActiveLogin from './Header/ActiveLogin';
import PropTypes from 'prop-types';

export default class Header extends React.Component {

    static propTypes = {
        session: PropTypes.object.isRequired,
        updateSessionCallback: PropTypes.func.isRequired,
    };

    render() {
        const {session, updateSessionCallback} = this.props;

        return (
            <div className="header">
                <div className="row align-items-center">
                    <div className="col-4">
                        <h1>
                            <div className="logo">
                                <Link to="/">
                                    <picture>
                                        <source srcSet={window.location.origin + '/pics/JTL-logo.png'} media="max-width:68em"
                                        />
                                        <img
                                        src={window.location.origin + '/pics/JTL-OneTimeLink-Logo-rgb.svg'}
                                        alt="JTL One Time Link"
                                        />
                                    </picture>
                                </Link>
                                <span>OneTimeLink</span>
                            </div>
                        </h1>
                    </div>
                    <input type="checkbox" id="offcanvas-menu" className="toggle"/>

                    <div className="contain col-8">

                        <aside className="menu-container">

                            <div className="menu-heading clearfix">
                                <label htmlFor="offcanvas-menu" className="close-btn">
                                    <i className="fa fa-times"/>
                                </label>
                            </div>


                            <nav className="slide-menu">
                                <ul className="nav justify-content-end">

                                    {
                                        session.isActive() && (
                                            <li className="nav-item">
                                                <Link to="/history" className="btn btn-link btn-sm">
                                                    <i className="fa fa-history"/>
                                                    <FormattedMessage
                                                        id="app.History.Action.ShowHide"/>

                                                </Link>
                                            </li>
                                        )
                                    }
                                    <li className="nav-item">
                                        <ActiveLogin
                                            session={session}
                                            updateSessionFlag={updateSessionCallback}
                                        />
                                    </li>
                                </ul>
                            </nav>
                        </aside>
                        {
                            session.isActive() && (
                                <div>
                                    <label htmlFor="offcanvas-menu" className="full-screen-close"/>

                                    <div className="menu right">
                                        <label htmlFor="offcanvas-menu" className="toggle-btn">
                                            <i className="fa fa-bars"/>
                                        </label>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        );
    }
}
