import React from 'react';
import PropTypes from 'prop-types';

export default class OneTimeLink extends React.Component {

    static propTypes = {
        text: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        onClick: PropTypes.func,
        getSessionToken: PropTypes.func,
    };

    constructor() {
        super();

        this.state = {
            text: 'Click here to retrieve Data',
            url: null,
        };
    }

    componentDidMount() {
        this.setState({
            text: this.props.text,
            url: this.props.url,
            onClick: this.props.onClick || this.state.onClick,
            sessionToken: this.props.getSessionToken()
        });
    }

    render() {
        if (this.state.sessionToken !== undefined) {
            return (
                <a id="otllink" target="_blank" rel="noopener noreferrer"
                   href={this.state.url + this.state.sessionToken}
                   onClick={this.props.onClick.bind(this)}
                >{this.state.text}</a>
            );
        }

        return null;
    }
}
