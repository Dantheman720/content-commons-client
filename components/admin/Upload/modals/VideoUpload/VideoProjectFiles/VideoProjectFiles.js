import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Form,
  Button,
  Icon,
  Modal
} from 'semantic-ui-react';
import ButtonAddFiles from 'components/ButtonAddFiles/ButtonAddFiles';
import VideoAssetFile from './VideoAssetFile';
import './VideoProjectFiles.scss';

class VideoProjectFiles extends PureComponent {
  state = {
    activeStep: 'step_1',
    cancelModalOpen: false
  }

  componentDidMount() {
    this.props.updateModalClassname( 'upload_modal prepare-files-active' );
  }

  componentWillUnmount() {
    this.props.updateModalClassname( 'upload_modal' );
  }

  toggleSteps = () => this.setState( prevState => ( {
    activeStep: prevState.activeStep === 'step_1' ? 'step_2' : 'step_1'
  } ) );

  openCancelModal = () => this.setState( { cancelModalOpen: true } );

  closeCancelModal = () => this.setState( { cancelModalOpen: false } );

  render() {
    const {
      closeModal,
      removeVideoAssetFile,
      replaceVideoAssetFile,
      files
    } = this.props;
    const { activeStep, cancelModalOpen } = this.state;

    return (
      <Fragment>
        <h5 className="videoProjectFiles_headline">Preparing { files.length } files for upload...</h5>
        <div className="videoProjectFiles_steps">
          <p
            className={ `videoProjectFiles_step videoProjectFiles_step--one ${activeStep === 'step_1' ? 'active' : ''}` }
          >
            Step 1
          </p>
          <Icon name="chevron right" size="tiny" />
          <p
            className={ `videoProjectFiles_step videoProjectFiles_step--two ${activeStep === 'step_2' ? 'active' : ''}` }
          >
            Step 2
          </p>
        </div>

        <Form className="videoProjectFiles">
          <Grid>
            <Grid.Row className="videoProjectFiles_column_labels">
              <Grid.Column width={ 6 }>
                <p className="videoProjectFiles_column_label">Files Selected</p>
              </Grid.Column>
              <Grid.Column width={ 10 }>
                { activeStep === 'step_1' && (
                  <Fragment>
                    <p className="videoProjectFiles_column_label videoProjectFiles_column_label--required">Language</p>
                    <p className="videoProjectFiles_column_label videoProjectFiles_column_label--required">Subtitles</p>
                  </Fragment>
                ) }
                { activeStep === 'step_2' && (
                  <Fragment>
                    <p className="videoProjectFiles_column_label videoProjectFiles_column_label--required">Type / Use</p>
                    <p className="videoProjectFiles_column_label videoProjectFiles_column_label--required">Quality</p>
                  </Fragment>
                ) }
              </Grid.Column>
            </Grid.Row>

            { files.map( ( file, i ) => (
              <VideoAssetFile
                key={ `${file}_${i}` }
                activeStep={ activeStep }
                file={ file }
                removeVideoAssetFile={ removeVideoAssetFile }
                replaceVideoAssetFile={ replaceVideoAssetFile }
              />
            ) ) }

            { activeStep === 'step_1' && (
              <Grid.Row>
                <ButtonAddFiles onChange={ e => this.props.handleVideoAssetsUpload( e ) } multiple className="secondary" />
              </Grid.Row>
            ) }
          </Grid>

          <Form.Field className="upload_actions">
            <Modal
              className="cancelModal"
              open={ cancelModalOpen }
              trigger={ (
                <Button
                  content="Cancel"
                  className="upload_button upload_button--cancelText"
                  onClick={ this.openCancelModal }
                />
              ) }
            >
              <Modal.Content>
                <h3>Are you sure you want to cancel uploading these files?</h3>
                <p>By cancelling, your files will not be uploaded to Content Commons.</p>
              </Modal.Content>
              <Modal.Actions>
                <Button
                  className="secondary"
                  content="No, take me back!"
                  onClick={ this.closeCancelModal }
                />
                <Button
                  className="upload_button upload_button--next"
                  content="Yes, cancel upload"
                  onClick={ closeModal }
                />
              </Modal.Actions>
            </Modal>
            <Button
              className={ `upload_button upload_button--previous ${activeStep === 'step_2' ? 'display' : ''}` }
              content="Previous"
              onClick={ this.toggleSteps }
            />
            <Button
              disabled={ activeStep === 'step_2' }
              className="upload_button upload_button--next"
              content="Next"
              onClick={ this.toggleSteps }
            />
          </Form.Field>
        </Form>
      </Fragment>
    );
  }
}

VideoProjectFiles.propTypes = {
  files: PropTypes.array,
  closeModal: PropTypes.func,
  updateModalClassname: PropTypes.func,
  handleVideoAssetsUpload: PropTypes.func,
  removeVideoAssetFile: PropTypes.func,
  replaceVideoAssetFile: PropTypes.func
};

export default VideoProjectFiles;
