import React from 'react';
import { FormattedMessage } from 'react-intl';

export default class CreatedBefore extends React.Component {

    render() {

        let date = Date.parse(this.props.dateString),
            now = Date.now(),
            diffms = now - date,
            minutes = parseInt(diffms / (1000 * 60), 10),
            hours = parseInt(diffms / (3600 * 1000), 10),
            days = parseInt(diffms / (24* 3600 * 1000), 10)
        ;

        let timestring = <FormattedMessage id="app.CreatedBefore.now"/>;

        if (minutes < 60 && minutes > 1) {
            timestring = <FormattedMessage
                id="app.CreatedBefore.minutesAgo"
                values={{amount: minutes}}
            />
        }

        if (hours >= 1) {
            timestring = <FormattedMessage
                id="app.CreatedBefore.hoursAgo"
                values={{amount: hours}}
            />
        }

        if (days >= 1) {
            timestring = <FormattedMessage
                id="app.CreatedBefore.daysAgo"
                values={{amount: days}}
            />
        }

        return (
            <span data-tip={this.props.dateString}>{timestring}</span>

        );
    }
}
