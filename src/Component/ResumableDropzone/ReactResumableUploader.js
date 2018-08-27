import Resumable from "resumablejs";
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import cx from 'classnames';

export default class ReactResumableUploader extends Component {

    static propTypes = {
        targetURL: PropTypes.string.isRequired,
        maxFileSize: PropTypes.number.isRequired,
        chunkSize: PropTypes.number.isRequired,
        maxFiles: PropTypes.number,
        simultaneousUploads: PropTypes.number,
        onFileError: PropTypes.func,
        onFileSuccess: PropTypes.func,
        onFileAdded: PropTypes.func,
        onMaxFileSizeErrorCallback: PropTypes.func,
        generateUniqueIdentifier: PropTypes.func,
        onFileRemoved: PropTypes.func,
        getFileListCallback: PropTypes.func,
        uploadToken: PropTypes.string,

    };

    static defaultProps = {
        maxFiles: 1,
        simultaneousUploads: 1,
    };

    constructor() {
        super();

        this.state = {
            fileList: [],
            uploadProgress: 0,
        };

        this.browseBtnRef = React.createRef();
    }

    callFnIfPropSet(prop, ...params) {
        if (typeof prop === 'function') {
            prop(...params);
        }
    }

    componentDidMount() {
        const resumable = new Resumable({
            target: this.props.targetURL,
            maxFileSize: this.props.maxFileSize,
            chunkSize: this.props.chunkSize,
            maxFiles: this.props.maxFiles,
            forceChunkSize: true,
            simultaneousUploads: this.props.simultaneousUploads,
            maxFileSizeErrorCallback: (file, errorCount) => {
                this.callFnIfPropSet(this.props.onMaxFileSizeErrorCallback, file, errorCount);
            },
            generateUniqueIdentifier: this.props.generateUniqueIdentifier,
            testChunks: false,
            query: {
                uploadToken: this.props.uploadToken
            }
        });

        resumable.assignBrowse(this.browseBtnRef.current);

        resumable.on('fileAdded', (file, event) => {
            this.callFnIfPropSet(this.props.onFileAdded, file, event);
        });

        resumable.on('fileError', (file, errorCount) => {
            this.callFnIfPropSet(this.props.onFileError, file, errorCount);
        });

        resumable.on('fileSuccess', (file, message) => {
            const {fileList} = this.state;
            fileList.push(file);

            this.setState({
                fileList
            }, () => {
                if (this.state.fileList.length >= this.props.maxFiles) {
                    this.browseBtnRef.current.onclick = () => {return false;};
                }

                this.callFnIfPropSet(this.props.onFileSuccess, file, message);
                this.callFnIfPropSet(this.props.getFileListCallback, fileList);
            });
        });

        resumable.on('progress', () => {
            const progress = resumable.progress() * 100;

            if (progress < 100) {
                this.setState({
                    uploadProgress: progress,
                });
            } else {
                this.setState({
                    uploadProgress: 100,
                }, () => {
                    setTimeout(() => {
                        this.setState({
                            uploadProgress: 0,
                        });
                    }, 1000);
                });
            }
        });

        this.resumable = resumable;
    }

    removeFile(removedFile) {
        const {fileList} = this.state;

        fileList.forEach((file, i) => {
            if (file.uniqueIdentifier === removedFile.uniqueIdentifier) {
                fileList.splice(i, 1);
                this.resumable.removeFile(removedFile);
                this.setState({
                    fileList,
                });
            }
        });

        if (this.state.fileList.length < this.props.maxFiles) {
            this.browseBtnRef.current.onclick = null;
        }

        this.callFnIfPropSet(this.props.onFileRemoved, removedFile, fileList.length);
        this.callFnIfPropSet(this.props.getFileListCallback, fileList);
    }

    renderFileList() {
        return this.state.fileList.map((file, i) => {
            return (
                <li className="list-group-item" key={i}>
                    <i className="fa fa-file fa-1x"/>
                    <strong> {file.file.name}</strong> - {file.file.size} bytes - {file.file.type}
                    <button
                        onClick={() => this.removeFile(file)}
                        className="btn btn-outline-primary btn-sm ml-2"
                    >
                        <FormattedMessage id="app.Upload.Delete" >
                            {(text) => (text)}
                        </FormattedMessage>
                    </button>
                </li>
            );
        });
    }

    render() {
        const {uploadProgress, fileList} = this.state;

        return (
            <div className="uploader">
                <span
                    id="upload-btn"
                    className={
                        cx(
                            "btn btn-outline-primary",
                            {"upload-btn-hidden": fileList.length >= this.props.maxFiles || uploadProgress > 0}
                        )
                    }
                    ref={this.browseBtnRef}
                >
                    <FormattedMessage id="app.Upload.UploadButton" >
                        {(text) => (text)}
                    </FormattedMessage>
                </span>
                <div className="progress" style={{display: uploadProgress === 0 ? "none" : "flex"}}>
                    <div className="progress-bar" style={{width: uploadProgress + "%"}}/>
                </div>
                <div className="dropzoneContent">
                    <ul className="list-group">
                        {this.renderFileList()}
                    </ul>
                </div>
            </div>
        );
    }
}
