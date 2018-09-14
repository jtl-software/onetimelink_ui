import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactLoading from 'react-loading';
import { FormattedMessage } from 'react-intl';
import axios from "axios/index";
import ReadLinkLink from './ReadLinkLink';
import {Redirect} from 'react-router-dom';

export default class LinkIntro extends Component {

    static propTypes = {
        hash: PropTypes.string.isRequired,
        api: PropTypes.string.isRequired,
        getSessionToken: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            files: {},
            text: '',
            tags: [],
            isAlive: false,
            contentType: null,
            name: null,
            isClicked: false,
            loading: true,
            shouldShowLink: false,
            isProtected: false,
        };
    }

    viewLink() {
        this.setState({
            shouldShowLink: true,
        });

        const sessionToken = this.props.getSessionToken().slice(1);

        axios.get(this.props.api + '/read/' + this.props.hash + '?view_text=1&' + sessionToken);
    }

    onClick() {
        this.setState({isClicked: true});
    }

    componentDidMount() {
        axios.get(this.props.api + '/check/' + this.props.content)
            .then((resp) => {
                const data = resp.data;
                this.setState({isAlive: data.alive});

                if (data.alive === true) {
                    if (data.files !== undefined && Object.keys(data.files).length > 0) {
                        this.setState({
                            files: data.files,
                        });
                    }

                    this.setState({
                        text: data.text,
                        isProtected: data.protected,
                    });

                    if (data.tags.length > 0) {
                        let tags = [];
                        data.tags.forEach((t, key) => {
                            tags.push({'key': key, 'text': t})
                        });
                        this.setState({tags: tags});
                    }
                }

                this.setState({
                    loading: false,
                });
            });
    }

    renderContent() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <div className="line">
                            <div className="white">
                                <i className="fa fa-exclamation-circle"/>
                            </div>
                        </div>
                        <div className="inner">
                            <div className="col otllink-desc">
                                <FormattedMessage id="app.ReadLink.HelpText"/>
                            </div>
                        </div>
                        <button 
                            className="btn link btn-sm mt-3 mb-3"
                            onClick={this.viewLink.bind(this)}
                        >
                            <FormattedMessage id="app.History.Label.GoNext"/>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    renderLoadingScreen() {
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

    render404() {
        return (
            <div className="col ReadLink__NotFound">
                <div className="error-pic"/>
                <div className="otllink">
                    <strong><FormattedMessage id="app.ReadLink.404" /></strong>
                    <br />
                    <FormattedMessage id="app.ReadLink.404Text"/>
                </div>
            </div>
        );
    }

    render() {
        const {isAlive, loading, shouldShowLink, files, isClicked, contentType, text, name, isProtected} = this.state;
        const {content} = this.props;

        if (isProtected && this.props.getSessionToken() === '?auth=null&ses=null') {
            return <Redirect
                to={{
                    pathname: '/login',
                    state: {
                        from: `/r${content}`,
                        reason: 'PROTECTED_LINK'
                    }
                }}
            />
        }

        if (loading) {
            return this.renderLoadingScreen();
        }

        if (isAlive) {
            if (shouldShowLink) {
                return (
                    <div className="ReadLink">
                        <div className="line">
                            <div className="white">
                                <i className="fa fa-lock" />
                            </div>
                        </div>
                        <div className="inner">
                            <div className="col otllink-desc"><pre>{text}</pre></div>

                            {Object.keys(files).length > 0 && (
                                <ReadLinkLink
                                    isClicked={isClicked}
                                    isAlive={isAlive}
                                    href={this.props.api + '/read/' + content}
                                    name={name}
                                    contentType={contentType}
                                    onClick={this.onClick.bind(this)}
                                    files={files}
                                    getSessionToken={this.props.getSessionToken}
                                />
                            )}
                        </div>
                    </div>
                );
            }

            return (
                <div className="ReadLink">
                    {this.renderContent()}
                </div>
            );
        } else {
            return (
                <div className="ReadLink">
                    {this.render404()}
                </div>
            );
        }
    }


}