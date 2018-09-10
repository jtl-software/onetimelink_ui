import React, {Component} from 'react';
import './App.css';
import axios from 'axios';
import Session from './Session/Session';
import CreateLink from './Component/CreateLink/CreateLink';
import GuestLink from './Component/CreateLink/GuestLink';
import LinkHistory from './Component/History/LinkHistory';
import Header from './Component/Header';
import DoLogin from './Component/Header/DoLogin';
import LinkIntro from './Component/ReadLink/LinkIntro';
import {Switch, Route} from 'react-router';
import {ProtectedRoute} from "./Component/Router/ProtectedRoute";
import Register from './Component/User/Register';
import Activate from './Component/User/Activate';
import ChangePassword from './Component/User/ChangePassword';
import ResetPasswordRequest from './Component/User/ResetPasswordRequest';
import ResetPasswordAction from './Component/User/ResetPasswordAction';
import Modal from "react-bootstrap4-modal";
import {FormattedMessage} from "react-intl";

export default class App extends Component {

    constructor() {
        super();

        this.state = {
            path: window.location.pathname,
            session: new Session('otl_ses_v1'),
            sessionActive: false,
            showModal: false,
            uploadCallback: this.handleTextUpload,
            isGuestLinkResponse: false,
            isModeCreate: false,
            guestLinkUrl: null,
            gustLinkHash: null,
            showHistory: false,
            history: {
                tagSuggestions: [],
                links: [],
            },
            error: {
                shown: false,
                title: null,
                text: null,
            },
        };
    }

    componentWillMount() {
        let isGuestLinkResponse = (new RegExp('^/g.*$')).test(this.state.path);

        this.setState({
            guestLinkUrl: this.state.path,
            isGuestLinkResponse: isGuestLinkResponse,
            isModeCreate:
            (new RegExp('^/$')).test(this.state.path) ||
            isGuestLinkResponse,
        });

        if (isGuestLinkResponse) {
            this.setState({guestLinkHash: this.state.path.substr(7)});
        }

        this.checkSession(true);
        this.intervalId = setInterval(this.checkSession.bind(this), 10000);
        this.hideError = this.hideError.bind(this);
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    handleSessionResult(data) {
        if (data.session === 'active') {

            const tagSuggestions = [];

            data.links.forEach((link, i) => {
                link.tags.forEach((tag, j) => {
                    tagSuggestions.push(tag);
                })
            });

            this.setState({
                history: {
                    links: data.links,
                    tagSuggestions
                },
            });

            return;
        }

        this.state.session.clear();
    }

    checkSession(force = false) {

        if (force === false && this.state.session.getSession() === null) {
            return;
        }

        let apiEndpoint = this.props.config.api + '/_/' + this.getSession();

        axios.get(apiEndpoint)
            .then((resp) => {
                this.handleSessionResult(resp.data);
            })
            .then(() => {
                this.updateSessionActiveFlag();
            });
    };

    updateSessionActiveFlag() {
        this.setState({sessionActive: this.state.session.isActive()});
    }

    handleCloseModal() {
        this.setState({showModal: false});
    }

    handleSession(authData) {
        if (authData.authtoken === 'undefined') {
            return;
        }

        if (authData.session === 'undefined') {
            return;
        }

        if (authData.authuser === 'undefined') {
            return;
        }

        this.setState({isAuthenticated: true});
        this.state.session.setSession(
            authData.authtoken,
            authData.session,
            authData.authuser,
        ).persist();
        this.handleCloseModal();
        this.updateSessionActiveFlag();
    }

    handleUpload(text, files, amount, tags, callback, httpMethod, apiPath, isProtected = false) {
        let apiEndpoint = this.props.config.api + apiPath + this.getSession();

        const formData = {};

        files.forEach((file, i) => {
            formData[`file${i}`] = file.getOpt('query').uploadToken;
        });

        formData['text'] = text;
        formData['amount'] = amount;
        formData['protected'] = isProtected;
        formData['tags'] = this.transformTagsForRequest(tags);

        axios({
            method: httpMethod,
            url: apiEndpoint,
            data: formData,
        })
            .then((resp) => {
                callback(resp.data);
            })
            .catch((err) => {
                if (err.response.status === 401) {
                    this.showError('HTTP Error 401 Unauthorized.');
                } else {
                    this.showError('Uncaught Error.\n' + err.response.statusText);
                }
            });
    }

    transformTagsForRequest(tags) {
        let tagsToSend = [];
        tags.map(f => tagsToSend.push(f.text));
        return tagsToSend;
    }

    handleGuestLink(tags, amount, callback, isProtected = false) {
        let apiEndpoint =
            this.props.config.api
            + '/create/guest'
            + this.getSession();

        const formData = {};

        formData['amount'] = amount;
        formData['tags'] = this.transformTagsForRequest(tags);
        formData['protected'] = isProtected;

        axios.post(apiEndpoint, formData)
            .then((resp) => {
                callback(resp.data);
            })
            .catch((err) => {
                if (err.response.status === 401) {
                    this.showError('HTTP Error 401 Unauthorized.');
                } else {
                    this.showError('Uncaught Error.\n' + err.response.statusText);
                }
            });
    }

    getSession() {
        return '?auth=' + this.state.session.getToken() + '&ses=' +
            this.state.session.getSession();
    }

    hideError(){
        this.setState({
            error: {
                shown: false,
            },
        });
    }

    showError(text){
        this.setState({
            error: {
                shown: true,
                title: (<FormattedMessage id="app.Error"/>),
                text: text,
            },
        });
    }

    render() {
        return (
            <div>
                <Modal visible={this.state.error.shown}>
                    <div className="modal-header">
                        <h5 className="modal-title">{this.state.error.title}</h5>
                    </div>
                    <div className="modal-body">
                        <p>{this.state.error.text}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={this.hideError}>
                            OK
                        </button>
                    </div>
                </Modal>
                <Header
                    session={this.state.session}
                    updateSessionCallback={this.updateSessionActiveFlag.bind(this)}
                />

                <div className="row content content-row">
                    <Switch>
                        <Route
                            exact
                            path="/password/reset/:hash"
                            render={(props) => (
                                <ResetPasswordAction
                                    {...props}
                                    api={this.props.config.api}
                                    hash={props.match.params.hash}
                                />
                            )}
                        />

                        <Route
                            exact
                            path="/password-reset"
                            render={(props) => (
                                <ResetPasswordRequest
                                    {...props}
                                    api={this.props.config.api}
                                />
                            )}
                        />

                        <Route
                            exact
                            path="/login"
                            render={(props) => (
                                <DoLogin
                                    {...props}
                                    api={this.props.config.api}
                                    handleSession={this.handleSession.bind(this)}
                                    isAuthenticated={this.state.session.isActive()}
                                />
                            )}
                        />

                        <ProtectedRoute
                            session={this.state.session}
                            exact
                            path="/"
                            render={(props) => (
                                <CreateLink
                                    tagSuggestions={this.state.history.tagSuggestions}
                                    handleUpload={this.handleUpload.bind(this)}
                                    handleGuestLink={this.handleGuestLink.bind(this)}
                                    baseURL={this.props.config.api}
                                    getSessionToken={this.getSession.bind(this)}
                                    showError={this.showError.bind(this)}
                                />
                            )}
                        />

                        <Route
                            session={this.state.session}
                            exact
                            path="/g:hash"
                            render={(props) => (
                                <GuestLink
                                    api={this.props.config.api}
                                    guestLinkHash={props.match.params.hash}
                                    handleUpload={this.handleUpload.bind(this)}
                                    getSessionToken={this.getSession.bind(this)}
                                    showError={this.showError.bind(this)}
                                />
                            )}
                        />

                        <Route
                            exact
                            path="/register"
                            render={(props) => (
                                <Register
                                    api={this.props.config.api}
                                />
                            )}
                        />

                        <Route
                            path="/r:hash"
                            render={(props) => (
                                <LinkIntro
                                    hash={props.match.params.hash}
                                    api={this.props.config.api}
                                    content={props.match.params.hash}
                                    getSessionToken={this.getSession.bind(this)}
                                />
                            )}
                        />

                        <ProtectedRoute
                            session={this.state.session}
                            exact
                            path="/history"
                            render={(props) => (
                                <LinkHistory
                                    links={this.state.history.links}
                                    checkSession={this.checkSession.bind(this)}
                                />
                            )}
                        />

                        <Route
                            exact
                            path="/user/activate/:hash"
                            render={(props) => (
                                <Activate
                                    api={this.props.config.api}
                                    hash={props.match.params.hash}
                                />
                            )}
                        />

                        <ProtectedRoute
                            session={this.state.session}
                            exact
                            path="/user/change-password"
                            render={(props) => (
                                <ChangePassword
                                    api={this.props.config.api}
                                    getSessionToken={this.getSession.bind(this)}
                                />
                            )}
                        />
                    </Switch>
                </div>
            </div>
        );
    }
}
