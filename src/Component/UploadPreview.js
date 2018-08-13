import React, {Component} from 'react';

export default class UploadPreview extends Component {

    render() {

        if(this.props.type === "image/jpeg"){
            return <img src={this.props.src}
                        className="uploadPreview"
                        height="32"
                        width="32"
                        alt="Uploaded File"
            />;
        }
        return <i className="fa fa-file fa-1x" />;
    }
}
