import React from 'react'
import {WithContext as ReactTags} from 'react-tag-input';
import {FormattedMessage} from 'react-intl';

export default class ReadLinkTag extends React.Component {
    render() {
        const {tags} = this.props;

        return (
            <div className="ReadLinkTag">
                {
                    tags.length > 0 && (
                        <div className="tags col-12">
                            <span><FormattedMessage id="app.ReadLink.Tag" /></span>
                            <ReactTags tags={tags} readOnly={true}/>
                        </div>
                    )
                }
            </div>
        )
    }
}
