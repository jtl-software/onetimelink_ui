import React from 'react';
import OneTimeLink from './OneTimeLink';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

export default class ReadLinkLink extends React.Component {
    static propTypes = {
        isClicked: PropTypes.bool,
        isAlive: PropTypes.bool,
        href: PropTypes.string,
        name: PropTypes.string,
        contentType: PropTypes.string,
        files: PropTypes.object.isRequired,
        onClick: PropTypes.func,
        getSessionToken: PropTypes.func,
    };

    static contextTypes = {
        intl: PropTypes.object.isRequired,
    };

    renderZipContents() {
        const {files} = this.props;

        return Object.keys(files).map((key, i) => {
            const file = files[key];
            let filename = file.name;
            let i18nID = 'Filename';

            if (filename === '') {
                filename = 'Text Input';
                i18nID = 'Type';
            }

            return (
                <div key={key}>
                    <FormattedMessage id={`app.ReadLink.Label.${i18nID}`}/>: {filename},&nbsp;
                    <FormattedMessage id="app.ReadLink.Label.ContentType"/>: {file.contentType}
                </div>
            );
        });
    }

    renderZipCount() {
        const {files} = this.props;
        const count = Object.keys(files).length;

        if (count === 1) {
            return (
                <div>
                    {count} <FormattedMessage id="app.ReadLink.Label.CountZipContentsSingular"/>
                </div>
            );
        }

        return (
            <div>
                {count} <FormattedMessage id="app.ReadLink.Label.CountZipContents"/>
            </div>
        );
    }

    render() {
        const {isClicked, isAlive, href, name, getSessionToken} = this.props;

        return (
            <div className="ReadLinkLink">
                {
                    !isClicked && isAlive
                        ?
                        <div>
                            <i className="fa fa-download" aria-hidden="true"/>
                            <OneTimeLink
                                url={href}
                                getSessionToken={getSessionToken}
                                onClick={this.props.onClick}
                                text={this.context.intl.formatMessage({id: 'app.ReadLink.Label.Link'})}
                            />
                            <div className="tooltip_otl">
                                <i className="fa fa-info-circle"/>
                                <span className="tooltiptext">
                                    <span className="otllink-meta">
                                        {this.renderZipCount()}
                                        {this.renderZipContents()}
                                    </span>
                                </span>
                            </div>
                        </div>
                        :
                        <div>
                            <FormattedMessage
                                id="app.ReadLink.ThankYouMessage"
                                values={{filename: name}}
                            />
                        </div>
                }
            </div>
        );
    }
}
