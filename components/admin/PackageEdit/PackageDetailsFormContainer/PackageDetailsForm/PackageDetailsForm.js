/**
 *
 * PackageDetailsForm
 *
 */
import React, { useState, createContext, Fragment } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { Form, Grid, Input } from 'semantic-ui-react';
import { getCount, getPluralStringOrNot } from 'lib/utils';
import FormikAutoSave from 'components/admin/FormikAutoSave/FormikAutoSave';
import ButtonAddFiles from 'components/ButtonAddFiles/ButtonAddFiles';
import TermsConditions from 'components/admin/TermsConditions/TermsConditions';
import EditPackageFiles from 'components/admin/PackageEdit/EditPackageFilesModal/EditPackageFilesModal';
import { useCrudActionsDocument } from 'lib/hooks/useCrudActionsDocument';
import './PackageDetailsForm.scss';

export const HandleOnChangeContext = createContext();

const PackageDetailsForm = props => {
  const {
    children,
    values,
    errors,
    touched,
    handleChange,
    hasInitialUploadCompleted,
    setFieldValue,
    // isSubmitting,
    // isValid,
    setFieldTouched,
    // status,
    save,
    pkg
  } = props;

  const router = useRouter();
  const { createFile } = useCrudActionsDocument();

  const [files, setFiles] = useState( [] );
  const [modalOpen, setModalOpen] = useState( false );
  const [progress, setProgress] = useState( 0 );

  const handleUploadProgress = ( progressEvent, file ) => {
    file.loaded = progressEvent.loaded;
    setProgress( progressEvent.loaded );
  };

  const removeCreateQryParamFromUrl = () => {
    router.replace(
      router.pathname,
      `/admin/package/${pkg.id}`,
      { shallow: true }
    );
  };

  const handleOnChange = (
    e,
    {
      name, value, type, checked
    }
  ) => {
    if ( type === 'checkbox' ) {
      setFieldValue( name, checked );
    } else {
      setFieldValue( name, value );
    }
    setFieldTouched( name, true, false );
  };

  const handleAddFiles = e => {
    const fileList = Array.from( e.target.files );
    setFiles( fileList );
    setModalOpen( true );
  };

  /**
   * Save  files from edit modal
   * @param {array} filesToSave
   */
  const handleSaveModalFiles = async filesToSave => {
    await Promise.all( filesToSave.map( async file => createFile( pkg, file, handleUploadProgress ) ) );

    // after initial save is complete, remove the "create" query param
    removeCreateQryParamFromUrl();
  };


  /**
   * Called from within edit modal to reset 'modalOpen' state to false
   * If we do not reset then the state will never change and the modal
   * will not reopen
   */
  const handleOnClose = () => {
    setModalOpen( false );
  };

  const getFormattedTypeName = type => {
    if ( type ) {
      switch ( type ) {
        case 'DAILY_GUIDANCE':
          return 'Guidance';
          // case 'SOME_FUTURE_TYPE':
          //   return 'Some Future Type';
        default:
          return type;
      }
    }
    return '';
  };

  return (
    <Fragment>
      { /* Only use autosave with existing project */ }
      { pkg.id && <FormikAutoSave save={ save } /> }
      <Form className="package-data">
        <Grid stackable>
          <Grid.Row>
            <Grid.Column width="16">
              <h3 className="headline">
                <span className="uppercase">Description</span>
                <br />
                <small className="msg--required">Required Fields *</small>
              </h3>
            </Grid.Column>

            <Grid.Column mobile={ 16 } tablet={ 5 } computer={ 5 }>
              <Form.Group widths="equal">
                <div className="field">
                  <Form.Field
                    id="title"
                    name="title"
                    control={ Input }
                    label="Package Title"
                    required
                    autoFocus
                    value={ values.title }
                    onChange={ handleOnChange }
                    error={ touched && touched.title && !!errors.title }
                  />
                  <p className="error-message">{ touched.title ? errors.title : '' }</p>
                </div>
              </Form.Group>
            </Grid.Column>

            <Grid.Column mobile={ 16 } tablet={ 4 } computer={ 4 }>
              <Form.Field
                id="type"
                name="type"
                control={ Input }
                label="Package Type"
                value={ getFormattedTypeName( values.type ) }
                onChange={ handleChange }
                readOnly
              />
            </Grid.Column>

            <Grid.Column mobile={ 16 } tablet={ 4 } computer={ 4 }>
              <Form.Field
                id="team"
                name="team"
                control={ Input }
                label="Team"
                value={ pkg?.team?.name || '' }
                readOnly
              />
            </Grid.Column>
          </Grid.Row>

          { !hasInitialUploadCompleted && (
            <Grid.Row reversed="computer">
              <Grid.Column mobile={ 11 }>
                <TermsConditions
                  handleOnChange={ handleOnChange }
                  error={ touched.termsConditions && !!errors.termsConditions }
                />
              </Grid.Column>
              <Grid.Column mobile={ 16 } computer={ 5 }>
                <EditPackageFiles
                  filesToEdit={ files }
                  extensions={ ['.doc', '.docx'] }
                  trigger={ (
                    <ButtonAddFiles
                      accept=".doc, .docx"
                      onChange={ handleAddFiles }
                      disabled={ !values.termsConditions }
                      fluid
                      multiple
                    >
                      Save draft & upload files
                    </ButtonAddFiles>
                  ) }
                  title={ `Preparing ${getCount( files )} ${getPluralStringOrNot( files, 'file' )} for upload... ` }
                  headerStyles={ { fontSize: '1em', marginBottom: '.8em' } }
                  modalOpen={ modalOpen }
                  onClose={ handleOnClose }
                  save={ handleSaveModalFiles }
                  progress={ progress }
                />
              </Grid.Column>
            </Grid.Row>
          ) }

          <Grid.Row>
            <Grid.Column width="16">
              <HandleOnChangeContext.Provider value={ handleOnChange }>
                { children }
              </HandleOnChangeContext.Provider>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Form>
    </Fragment>
  );
};

PackageDetailsForm.propTypes = {
  // id: PropTypes.string,
  // assetPath: PropTypes.string,
  pkg: PropTypes.object,
  children: PropTypes.node,
  // status: PropTypes.string,
  handleChange: PropTypes.func,
  hasInitialUploadCompleted: PropTypes.bool,
  values: PropTypes.object,
  errors: PropTypes.object,
  touched: PropTypes.object,
  setFieldValue: PropTypes.func,
  // isSubmitting: PropTypes.bool,
  // isValid: PropTypes.bool,
  setFieldTouched: PropTypes.func,
  save: PropTypes.func
};

export default PackageDetailsForm;
