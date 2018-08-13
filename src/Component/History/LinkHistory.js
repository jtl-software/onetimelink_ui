import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import moment from 'moment';

export default class LinkHistory extends React.Component {

    constructor() {
        super();

        this.state = {
            hideDeleted: true,
        };

        this.hideDeletedRef = React.createRef();
    }

    onCopy() {
        this.setState({styleClassName: 'otllink-copied'});
    }

    hideDeletedLink() {
        this.setState({hideDeleted: this.hideDeletedRef.current.checked});
    }

    getLinkDeleted(link) {
        return Object.keys(link)
            .filter((key) => {return key !== 'hash'})
            .reduce((a, b) => {return a && link[b].deleted}, link[Object.keys(link)[0]].deleted);
    }

    renderLinkItems(link) {
        return Object.keys(link.attachments).map((key) => {
            const item = link.attachments[key];
            let name = item.name;
            
            if (name === '-#-TEXTINPUT-#-') {
                name = 'User defined text input';
            }

            return (
                <div className="list-group-item" key={key}>
                    <div className="card-text">
                        {name},&nbsp;
                        <FormattedMessage id="app.History.Label.ContentType"/>
                        :&nbsp;{item.filetype}&nbsp;-&nbsp;
                        <FormattedMessage id="app.History.Label.Created"/>
                        :&nbsp;{moment(item.created).format('YYYY-MM-DD HH:mm:ss')}
                    </div>
                </div>
            );
        });
    }

    componentDidMount() {
        this.props.checkSession();
    }

    renderGuestLink(link) {
        return (
            <div className="list-group-item">
                <div className="card-text">
                    <FormattedMessage id="app.History.Label.GuestLink" />,&nbsp;
                    <FormattedMessage id="app.History.Label.Created" />
                    :&nbsp;{moment(link.created).format('YYYY-MM-DD HH:mm:ss')}
                </div>
            </div>
        );
    }

    render() {
        if (this.props.links.length <= 0) {
            return (null);
        }

        const links = Object.keys(this.props.links).filter((link) => {
            return !(this.state.hideDeleted && this.props.links[link].deleted !== null);
        }).map((link) => {
            return this.props.links[link];
        });

        return (
            <div className="LinkHistory__LinkHistory">
                <Link to="/">
                    <button className="btn link btn-sm mt-3 mb-3">
                        <FormattedMessage id="app.History.Label.GoBack"/>
                    </button>
                </Link>
                <h3><FormattedMessage id="app.History.Header"/></h3>
                <div>

                        <input className="form-check-input" id="checkhistory" type="checkbox"
                               onChange={this.hideDeletedLink.bind(this)}
                               ref={this.hideDeletedRef}
                               checked={this.state.hideDeleted}
                        /><label className="form-check-label" htmlFor="checkhistory"><FormattedMessage id="app.History.Label.HideUsed" values={{amount: this.props.links.length - links.length}}/>
                    </label>
                </div>
                <div className="list-group">
                    {links.slice(0).reverse().map((link, key) => {
                        let fragment = link.is_guest_link ? '#/g' : '#/r';
                        let filename = Object.values(link.attachments)[0].name;

                        if (filename === '-#-TEXTINPUT-#-') {
                            filename = 'Text input';
                        }

                        return (
                            <div key={key} className="card mt-4 mb-4">
                                <div className="card-header">
                                    <h3 className="card-title">{filename}</h3>
                                </div>
                                <div className="card-body">
                                    <div className="list-group list-group-flush">
                                        {!link.is_guest_link && this.renderLinkItems(link)}
                                        {link.is_guest_link && this.renderGuestLink(link)}
                                        <div className="list-group-item" key={'hist-item-hash'}>
                                            <div className="card-text">
                                                Hash: {link.hash}
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            {link.tags.filter((tag) => {return tag !== '';}).map((t, key) => (
                                                <span key={key} className="ReactTags__tag">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                    {
                                        (link.deleted === null)
                                            ?
                                            <CopyToClipboard
                                                text={window.location.origin + fragment + link.hash}
                                                onCopy={this.onCopy.bind(this)}>
                                                <button
                                                    className="btn link btn-sm mt-3">
                                                    <FormattedMessage id="app.History.Action.CopyLink"/>
                                                </button>
                                            </CopyToClipboard>
                                            :
                                            <small>
                                                <FormattedMessage id="app.History.Label.Deleted"/>
                                                &nbsp;{moment(this.getLinkDeleted(link)).format('YYYY-MM-DD HH:mm:ss')}
                                            </small>
                                    }
                                </div>
                            </div>
                        );
                    })}
                </div>
                <Link to="/">
                    <button className="btn link btn-sm mt-5 mb-5">
                        <FormattedMessage id="app.History.Label.GoBack"/>
                    </button>
                </Link>
            </div>
        );
    }
}
