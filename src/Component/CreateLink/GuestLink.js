import React from 'react';
import ResumableDropzone from '../ResumableDropzone/ReactResumableUploader';
import axios from 'axios';
import {FormattedMessage} from 'react-intl';
import PropTypes from "prop-types";

export default class GuestLink extends React.Component {

    static contextTypes = {
        intl: PropTypes.object.isRequired,

    };

    static propTypes = {
        getSessionToken: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.state = {
            tags: [],
            inputType: 'text',
            files: [],
            styleClassName: 'otllink-hide',
            guestlinkfilled: false,
            isFilledError: true,
            emptyError: false,
            displayProgressBar: false,
            fileTooLarge: false,
            isUploading: false,
            disableSubmit: true,
            textData: '',
            isProtected: false,
        };

        this.textData = React.createRef();
    }

    componentWillMount() {
        axios.get(this.props.api + '/check/' + this.props.guestLinkHash)
            .then((resp) => {
                this.setState({isAlive: resp.data.alive});
                if (resp.data.alive === true) {
                    let tags = [];
                    if (tags.length > 0) {
                        resp.data.tags.map((t, key) => (tags.push({'key': key, 'text': t})));
                    }
                    this.setState({
                        tags,
                        isProtected: resp.data.protected
                    });
                }

                if (this.state.isAlive === false) {
                    this.setState({guestlinkfilled: true,});
                }
            });
    }

    createLink(e) {
        e.preventDefault();
        this.setState({styleClassName: ''});

        this.props.handleUpload(
            this.state.textData,
            this.state.files,
            1,
            this.state.tags,
            this.displayResult.bind(this),
            'POST',
            '/create/' + this.props.guestLinkHash,
            this.state.isProtected
        );
    }

    displayResult() {
        this.setState({
            guestlinkfilled: true,
            isFilledError: false,
        });
    }

    removeFile(removedFile, filesLeft) {
        if (filesLeft === 0) {
            this.setState({
                disableSubmit: this.state.textData === '',
            });
        }
    }

    onTextDataChange(e) {
        this.setState({
            textData: e.target.value,
            disableSubmit: (this.state.files.length === 0 && e.target.value === '') || this.state.isUploading
        });
    }

    setFileList(newFileList) {
        this.setState({
            files: newFileList,
        });
    }

    render() {
        let uploadComponent = (
            <div>
                <strong><FormattedMessage id="app.Guest.Introduction.1"/></strong><br /><br />
                <FormattedMessage id="app.Guest.Introduction.2"/><br />
                <FormattedMessage id="app.Guest.Introduction.3"/><br/>
                <FormattedMessage id="app.Guest.Introduction.4"/><br/><br/>
                <div className="text-input-guest col-12 left-1">
                    <div className="typeSelection guest">
                        <label className="active">
                            <i aria-hidden="true" className="fa fa-file" />
                            <span className="modal-title">Text einfügen</span>
                        </label>
                    </div>
                    <textarea
                        value={this.state.textData}
                        onChange={this.onTextDataChange.bind(this)}
                        placeholder={this.context.intl.formatMessage({id:'app.CreateLink.Label.TextZone'})}
                    />
                </div>
                <div className="drop-guest col-12">
                    <div className="typeSelection guest">
                        <label className="active">
                            <i aria-hidden="true" className="fa fa-upload" />
                            <span className="modal-title">Dateiupload</span>
                        </label>
                    </div>
                    <div className="dashed">
                        <ResumableDropzone
                            targetURL={`${this.props.api}/prepare_create${this.props.getSessionToken()}`}
                            maxFileSize={1024 ** 3 * 100 /* 100 GB */}
                            chunkSize={1024 ** 2 * 15 /* 15 MB */}
                            maxFiles={1}
                            onFileError={(file, msg) => {
                                setTimeout(() => {
                                    file.retry();
                                }, 5000);
                            }}
                            onFileSuccess={(file, message) => {
                                this.setState({
                                    isUploading: false,
                                    disableSubmit: false,
                                });
                            }}
                            onFileAdded={(file, event) => {
                                file.resumableObj.upload();
                                this.setState({
                                    isUploading: true,
                                    disableSubmit: true,
                                });
                            }}
                            onMaxFileSizeErrorCallback={(file) => {
                                this.setState({
                                    fileTooLarge: true,
                                });
                            }}
                            onFileRemoved={(removedFile, filesLeft) => {
                                this.removeFile(removedFile, filesLeft);
                            }}
                            generateUniqueIdentifier={(file, event) => {
                                const now = Math.round((new Date()).getTime() / 1000);
                                return file.name + file.size + now;
                            }}
                            getFileListCallback={fileList => {
                                this.setFileList(fileList);
                            }}
                        />
                        {this.state.fileTooLarge && (
                            <div className="text-danger">
                                <FormattedMessage
                                    id="app.Upload.FileTooLarge"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );

        return (
            <div className="col">
                {!this.state.guestlinkfilled && (
                    <div>
                        {uploadComponent}

                        {this.state.emptyError && (
                            <div className="text-danger">
                                <FormattedMessage id="app.CreateLink.EmptyError" />
                            </div>
                        )}

                        <div className='col create-link'>
                            <button
                                className={'btn btn-lg link-o ' + (this.state.disableSubmit && this.state.inputType !== 'guest' && 'disabled')}
                                onClick={this.createLink.bind(this)}
                                disabled={this.state.disableSubmit && this.state.inputType !== 'guest'}
                            >
                                <FormattedMessage id="app.CreateLink.Label.Send"/>
                            </button>
                        </div>
                        <div className="col History__LinkHistory"/>
                    </div>
                )}

                {!this.state.isFilledError && this.state.guestlinkfilled && (
                    <div>
                        <div className="success-pic"/>
                        <div className="otllink">
                            <strong><FormattedMessage id="app.ReadLink.GuestLinkFilled"/></strong>
                            <br/>
                            <FormattedMessage id="app.ReadLink.GuestLinkFilledText"/>
                        </div>
                    </div>
                )}

                {this.state.isFilledError && this.state.guestlinkfilled && (
                    <div>
                        <div className="error-pic"/>
                        <div className="otllink">
                            <strong><FormattedMessage id="app.ReadLink.404"/></strong>
                            <br/>
                            <FormattedMessage id="app.ReadLink.404Text"/>
                        </div>
                    </div>
                )}

                <div className="col otllink-desc">
                </div>
            </div>
        );
    }
}
