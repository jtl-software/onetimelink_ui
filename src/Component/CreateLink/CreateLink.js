import React, {Component} from 'react';
import ResumableDropzone from '../ResumableDropzone/ReactResumableUploader';
import CopyToClipboard from 'react-copy-to-clipboard';
import {WithContext as ReactTags} from 'react-tag-input';
import UUID from 'react-native-uuid';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';
import NumericInput from 'react-numeric-input';
import {Link} from 'react-router-dom';
import axios from "axios";
import filesize from 'filesize';
import ReactLoading from "react-loading";

export default class CreateLink extends Component {

    static contextTypes = {
        intl: PropTypes.object.isRequired,

    };

    static propTypes = {
        baseURL: PropTypes.string.isRequired,
        getSessionToken: PropTypes.func.isRequired,
        tagSuggestions: PropTypes.array,
    };

    constructor() {
        super();
        this.state = {
            tags: [],
            suggestions: [],
            inputType: 'text',
            files: [],
            links: [],
            styleClassName: [],
            amountLinks: 1,
            uncommittedTag: '',
            fileTooLarge: false,
            emptyError: false,
            isUploading: false,
            disableSubmit: true,
            textData: '',
            isLinkProtected: false,
            chunkSize: null,
            maxFileSize: null,
            quota: 0,
            usedQuota: 0
        };

        this.handleDelete = this.handleDelete.bind(this);
        this.handleAddition = this.handleAddition.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.tagSuggestions !== undefined) {
            const suggestions = nextProps.tagSuggestions.map((text, id) => {
                return {id: `${id}`, text}
            });
    
            return {suggestions};
        }

        return null;
    }

    componentDidMount(){
       this.getUploadLimits();
    }

    handleDelete(i) {
        let tags = this.state.tags;
        tags.splice(i, 1);
        this.setState({tags: tags});
    }

    handleAddition(tag) {
        let tags = this.state.tags;

        if (tags.length < 5) {
            tags.push({
                id: UUID.v4(),
                text: tag.text,
            });
            this.setState({
                tags: tags,
                uncommittedTag: '',
            });
        }
    }

    createLink(e) {
        e.preventDefault();
        this.setState({styleClassName: []});

        if (this.state.uncommittedTag !== '') {
            this.handleAddition({ text: this.state.uncommittedTag });
        }

        if (this.state.inputType === 'guest') {
            this.props.handleGuestLink(
                this.state.tags,
                this.state.amountLinks,
                this.displayGuestLinkResult.bind(this),
                this.state.isLinkProtected
            );
        } else {
            this.props.handleUpload(
                this.state.textData,
                this.state.files,
                this.state.amountLinks,
                this.state.tags,
                this.displayResult.bind(this),
                this.props.isGuestLinkResponse ? 'PUT' : 'POST',
                this.props.isGuestLinkResponse ?
                    '/create/' + this.props.guestLinkHash :
                    '/create',
                this.state.isLinkProtected
            );
        }
    }

    getUploadLimits(){
        axios.get(this.props.baseURL + '/upload_limits' + this.props.getSessionToken()).then((resp) => {
            if(resp.status === 200 ){
                this.setUploadLimits(resp.data.chunkSize, resp.data.maxFileSize, resp.data.quota || null, resp.data.usedQuota || null);
            }else{
                console.log('Failed to request upload limits');
            }
        });
    }

    displayResult(data) {
        const links = data.links.map((link) => {
            return window.location + 'r' + link.hash;
        });

        this.setState({links});
    }

    displayGuestLinkResult(data) {
        const links = data.links.map((link) => {
            return window.location + 'g' + link.hash;
        });

        this.setState({links});
    }

    onCopy(i) {
        const styles = this.state.styleClassName;
        styles[i] = 'otllink-copied';
        this.setState(styles);
    }

    onTagsChange(e) {
        this.setState({
            uncommittedTag: e,
        });
    }

    setUploadType(type, e) {
        this.setState({inputType: type});
        this.clearLink();
    }

    setLinkAmount(valueAsNumber, valueAsString, e) {
        this.setState({
            amountLinks: valueAsNumber,
        });
    }

    clearLink() {
        this.setState({
            links: [],
            files: [],
            tags: [],
            textData: '',
            isLinkProtected: false,
            disableSubmit: true,
        });
    }

    filtersug(query, possibleSuggestionsArray) {
        const tags = [];
        possibleSuggestionsArray.forEach(function(suggestion)  {
            const filtered = tags.filter(tag=>{return tag.text === suggestion.text;});
            if (filtered.length === 0 && suggestion.text.toLowerCase().includes(query.toLowerCase())) {tags.push(suggestion);}
        });
        return tags;
    }

    onTextDataChange(e) {
        this.setState({
            textData: e.target.value,
            disableSubmit: (this.state.files.length === 0 && e.target.value === '') || this.state.isUploading
        });
    }

    removeFile(removedFile, filesLeft) {
        if (filesLeft === 0) {
            this.setState({
                disableSubmit: this.state.textData === '',
            });
        }
    }

    onProtectedChange(e) {
        this.setState({
            isLinkProtected: e.target.checked,
        });

    }

    setFileList(newFileList) {
        this.setState({
            files: newFileList,
        });
    }

    setUploadLimits(chunkSize, maxFileSize, quota, usedQuota){
        this.setState({
            chunkSize: chunkSize,
            maxFileSize: maxFileSize,
            quota: quota,
            usedQuota: usedQuota
        });
    }

    prepareUpload(guestLinkHash, file){
        axios.post(this.props.baseURL+ '/request_upload' + this.props.getSessionToken()).then((resp) => {
            if(resp.status === 200 ){
                file.resumableObj.opts.query.uploadToken = resp.data.uploadToken;
                file.resumableObj.upload();
                this.setState({
                    isUploading: true,
                    disableSubmit: true,
                });
            }else{
                console.log('Failed to request token');
            }
        });
    }

    deleteUpload(file){
        axios.post(this.props.baseURL+ '/delete_upload/'+ file.resumableObj.opts.query.uploadToken + this.props.getSessionToken()).then((resp) => {
            this.getUploadLimits();
        });
    }

    getMaxFileSize(){
        if(this.state.quota !== null){
            let freeSpace = this.state.quota - this.state.usedQuota;
            if(freeSpace < this.state.maxFileSize){
                return freeSpace;
            }
        }
        return this.state.maxFileSize;
    }

    render() {
        let guesttext = "";
        let uploadComponent = ( <div className="container">
            <div className="row mt-4">
                <div className="col-2 offset-5">
                    <ReactLoading type="spinningBubbles" color="#26292c" height={128} width={128} />
                </div>
            </div>
        </div>);
        if(this.state.chunkSize && this.state.maxFileSize) {
            uploadComponent = (
                <div>
                    <div className="text-input col-8 left-1">
                        <h3><FormattedMessage id="app.CreateLink.Label.UploadTitel"/></h3>
                        <p><FormattedMessage id="app.CreateLink.Explanation.Upload"/></p>
                        <textarea
                            value={this.state.textData}
                            onChange={this.onTextDataChange.bind(this)}
                            placeholder={this.context.intl.formatMessage({id: 'app.CreateLink.Label.TextZone'})}
                        />
                    </div>
                    <div className="drop col-8 left-1">
                        <div className="dashed">
                            <ResumableDropzone
                                targetURL={`${this.props.baseURL}/upload`+ this.props.getSessionToken()}
                                maxFileSize={this.getMaxFileSize()}
                                chunkSize={this.state.chunkSize}
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
                                    this.getUploadLimits();
                                }}
                                onFileAdded={(file, event) => {
                                    this.prepareUpload(this.props.guestLinkHash, file);
                                    this.setState({
                                        isUploading: true,
                                        disableSubmit: true,
                                        fileTooLarge: false,
                                    });
                                }}
                                onMaxFileSizeErrorCallback={(file) => {
                                    this.setState({
                                        fileTooLarge: true,
                                    });
                                }}
                                onFileRemoved={(removedFile, filesLeft) => {
                                    this.deleteUpload(removedFile);
                                    this.removeFile(removedFile, filesLeft);
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
                        <div className="one-file-hint">
                            <FormattedMessage
                                id="app.Upload.OneFileHint"
                            />
                        </div>
                        <div className="one-file-hint">
                            <FormattedMessage
                                id="app.Upload.FileSize"
                            />
                            {filesize(this.state.maxFileSize)}
                        </div>
                        {(this.state.quota !== 0 && this.state.quota !== null) && (
                            <div className="one-file-hint">
                            <FormattedMessage
                            id="app.Upload.Quota"
                            />
                            {filesize(this.state.usedQuota)}
                            <FormattedMessage
                            id="app.Upload.QuotaOf"
                            />
                            {filesize(this.state.quota)}
                            <FormattedMessage
                            id="app.Upload.QuotaUsed"
                            />
                            </div>)
                        }
                    </div>
                </div>
            );
        }
        if (this.state.inputType === 'guest') {
            uploadComponent = <div/>;
            guesttext = (<div className="explain">
                <h3><FormattedMessage id="app.CreateLink.Label.GuestTitel"/></h3>
                <p><FormattedMessage id="app.CreateLink.Explanation.Guest"/></p>
            </div>);
        }

        return (
            <div className="col">
                {
                    this.state.links.length === 0
                        ?
                        <div>
                            <div className="typeSelection col-4">
                                <div data-toggle="buttons">
                                    <label
                                        onClick={this.setUploadType.bind(this, 'text')}
                                        className={'btn btn-outline-primary ' +
                                    (this.state.inputType !== 'guest' ? 'active' : '')}>
                                        <i className="fa fa-download" aria-hidden="true"/>
                                        <input type="radio" value="file"
                                               checked={this.state.inputType === ''}
                                        />
                                        <FormattedMessage id="app.CreateLink.Label.Upload"/>
                                    </label>
                                    {
                                        !this.props.isGuestLinkResponse && (
                                            <label
                                                onClick={this.setUploadType.bind(this, 'guest')}
                                                className={'btn btn-outline-primary ' +
                                                (this.state.inputType === 'guest' ?
                                                    'active' :
                                                    '')}>
                                                <i className="fa fa-user-plus" aria-hidden="true"/>
                                                <input type="radio" value="guest"
                                                       checked={this.state.inputType === 'guest'}
                                                />
                                                <FormattedMessage id="app.CreateLink.Label.TypeGuest"/>
                                            </label>
                                        )
                                    }
                                </div>
                            </div>

                            {uploadComponent}

                            <div className="tags col-8 left-1 mb-5">
                                {guesttext}
                                <FormattedMessage id="app.CreateLink.Label.AddTags"/>
                                <div className="input-group">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">&#35;</span>
                                    </div>
                                    <ReactTags tags={this.state.tags}
                                               suggestions={this.state.suggestions}
                                               handleDelete={this.handleDelete}
                                               handleAddition={this.handleAddition}
                                               minQueryLength={1}
                                               handleFilterSuggestions = {(query)=>this.filtersug(query, this.state.suggestions)}
                                               placeholder={this.context.intl.formatMessage({id: "app.CreateLink.Action.AddTag"})}
                                               allowDeleteFromEmptyInput={false}
                                               autofocus={false}
                                               handleInputChange={this.onTagsChange.bind(this)}
                                    />
                                </div>
                                <div className="link-amount col-6 float-left">
                                    <span>
                                        <FormattedMessage id="app.CreateLink.Amount" />
                                    </span>
                                    <NumericInput
                                        min={1}
                                        value={this.state.amountLinks}
                                        onChange={this.setLinkAmount.bind(this)}
                                        className="form-control"
                                        style={{
                                            input: {
                                                width: '100%',
                                            }
                                        }}
                                    />
                                </div>
                                <div className="protected-check col-12 float-left">
                                    <label htmlFor="protected-checkbox">
                                        <input
                                            type="checkbox"
                                            id="protected-checkbox"
                                            onChange={this.onProtectedChange.bind(this)}
                                            checked={this.state.isLinkProtected}
                                        />
                                        <span>
                                            <FormattedMessage id="app.CreateLink.Protected" />
                                        </span>
                                    </label>
                                </div>

                                {this.state.emptyError && (
                                    <div className="text-danger">
                                        <FormattedMessage id="app.CreateLink.EmptyError" />
                                    </div>
                                )}

                                <div className='create-link'>
                                    <button
                                        className={'btn btn-lg link ' + (this.state.disableSubmit && this.state.inputType !== 'guest' && 'disabled')}
                                        onClick={this.createLink.bind(this)}
                                        disabled={this.state.disableSubmit && this.state.inputType !== 'guest'}
                                    >
                                        <FormattedMessage id="app.CreateLink.Label.Create"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                        :
                        <div>
                            {this.state.links.map((link, i) => {
                                return (
                                    <CopyToClipboard text={link}
                                                     onCopy={this.onCopy.bind(this, i)}
                                                     key={i}
                                    >
                                        <div className={'otllink ' + this.state.styleClassName[i]}>
                                            {link}<br/><FormattedMessage id="app.CreateLink.Label.Click2Copy"/>
                                        </div>
                                    </CopyToClipboard>
                                );
                            })}
                            <Link to="/" onClick={this.clearLink.bind(this)}>
                                <button className="center btn btn-lg link">
                                    <FormattedMessage id="app.CreateLink.Label.CreateNew"/>
                                </button>
                            </Link>
                        </div>

                }

                <div className="col otllink-desc"/>

            </div>
        );
    }
}
