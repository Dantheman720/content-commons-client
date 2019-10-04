/**
 *
 * ProjectUnits
 *
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, graphql } from 'react-apollo';
import { Card } from 'semantic-ui-react';
import { getFileExt } from 'lib/utils';
import isEmpty from 'lodash/isEmpty';
import withFileUpload from 'hocs/withFileUpload/withFileUpload';
import { searchTreeForS3FileDirectories } from 'lib/upload';
import { buildUnit, buildVideoFileTree } from 'lib/graphql/builders/video';
import { LANGUAGES_QUERY } from 'components/admin/dropdowns/LanguageDropdown';
import {
  VIDEO_PROJECT_QUERY,
  DELETE_VIDEO_FILE_MUTATION,
  UPDATE_VIDEO_FILE_MUTATION,
  UPDATE_VIDEO_UNIT_MUTATION,
  DELETE_MANY_VIDEO_UNITS_MUTATION,
  UPDATE_VIDEO_PROJECT_MUTATION
} from 'lib/graphql/queries/video';

// renmae this it generic
import EditProjectFiles from '../ProjectEdit/EditProjectFilesModal/EditPojectFilesModal';

import ProjectUnitItem from './ProjectUnitItem/ProjectUnitItem';
import './ProjectUnits.scss';

const ProjectUnits = props => {
  const {
    projectId,
    videoProject,
    filesToUpload,
    uploadExecute,
    updateVideoUnit,
    deleteManyVideoUnits,
    updateVideoProject,
    updateVideoFile,
    heading,
    extensions
  } = props;

  const hasProjectUnits = () => ( !isEmpty( videoProject ) && videoProject.project && videoProject.project.units );
  const hasFilesToUpload = () => ( filesToUpload && filesToUpload.length );

  const separateFilesByLanguage = files => {
    const languages = {};
    files.forEach( file => {
      if ( !languages[file.language] ) {
        languages[file.language] = [];
      }
      languages[file.language].push( file );
    } );

    return languages;
  };

  /**
   * Checks file changes against stored file to see if language has changed
   * @param {object} unit unit that file belongs to
   * @param {object} file possible changed file
   */
  const hasFileLanguageChanged = ( unit, file ) => {
    const found = unit.files.find( f => f.id === file.id );
    if ( found ) {
      return file.language !== found.language.id;
    }
  };

  /**
   * Only allows files to be uploaded that have the correct extension for this unit
   * @param {*} filesToVerify
   */
  const getAllowedExtensions = filesToVerify => filesToVerify.filter( file => extensions.includes( getFileExt( file.input.name ) ) );

  /**
   * Returns all nested files
   */
  const getFilesToEdit = () => {
    let filesToEdit = [];
    if ( hasProjectUnits() ) {
      videoProject.project.units.forEach( unit => {
        filesToEdit = [...filesToEdit, ...unit.files];
      } );
    }

    return filesToEdit;
  };

  /**
   * Compare files scheduled to be removed against current files in unit.
   * and if there will be no files left after removal add to removal array
   * @param {array} filesToRemove
   */
  const getUnitsToRemove = files => {
    const unitsToRemove = [];

    videoProject.project.units.forEach( u => {
      // if a unit does not have any files then remove
      const found = files.find( file => file.language === u.language.id );
      if ( !found ) {
        unitsToRemove.push( u );
      }
    } );

    return unitsToRemove;
  };

  /**
   * Separates files into units and normalizes data structure
   * for consistent rendering. New files have an 'input' prop
   * of type File. These come in via redux.
   */
  const getUnitsForNewProject = () => {
    // add this to unit state so titles update on upload
    const newUnits = {};

    const allowedFiles = getAllowedExtensions( filesToUpload );

    // 1. Separate files by language
    allowedFiles.forEach( file => {
      if ( !newUnits[file.language] ) {
        newUnits[file.language] = [];
      }
      newUnits[file.language].push( file );
    } );

    // 2. Normalize data structure for consistent ui rendering (same structure as graphql unit)
    const entries = Object.entries( newUnits );
    return entries.map( entry => {
      const [language, fileObjs] = entry;
      return ( {
        files: fileObjs, // spread may break connection
        language: {
          id: language,
          displayName: props.languageList.languages.find( l => l.id === language ).displayName
        }
      } );
    } );
  };

  /**
   * Locates unit file belongs to
   * @param {*} file
   */
  const getFileUnit = file => {
    const len = videoProject.project.units.length;

    /* eslint-disable no-plusplus */
    for ( let i = 0; i < len; i++ ) {
      const unit = videoProject.project.units[i];
      const found = unit.files.find( f => f.id === file.id );
      if ( found ) {
        return unit;
      }
    }
  };

  /**
   * Convenience function to define query structure
   * @param {string} id project id
   * @param {object} updatedData updates to save
   */
  const getQuery = ( id, updatedData ) => ( {
    variables: {
      data: updatedData,
      where: {
        id
      }
    }
  } );

  /**
  * We are assumng a single thumbnail per language although the data
  * model can support multiple thumbnails per language (in diff sizes)
  * todo: refactor to to support multiple thumbnails per language
  * @param {*} language language d of file
  */
  const getLanguageThumbnail = language => {
    const { project: { thumbnails } } = videoProject;
    const thumbnail = thumbnails.find( tn => tn.language.id === language );
    if ( thumbnail ) {
      return thumbnail;
    }

    // if thumbnail does not exist iin language, return english
    return thumbnails.find( tn => tn.language.displayName === 'English' );
  };

  const getTagIds = ( tags = [] ) => tags.map( tag => tag.id );

  /**
   * If file language has changed, disconnect from current language
   * @param {object} unit unit file currently belongs to
   * @param {object} file
   */
  const disconnectFileFromUnit = async ( unit, file ) => updateVideoUnit( getQuery( unit.id, {
    files: {
      disconnect: { id: file.id }
    }
  } ) );

  /**
   * If file language has changed, connect to new language
   * @param {object} unit unit to connect file to
   * @param {object} file
   */
  const connectFileToUnit = async ( unit, file ) => updateVideoUnit( getQuery( unit.id, {
    files: {
      connect: { id: file.id }
    }
  } ) );

  /**
   * Creates anew uniit and add files to it
   * @param {*} language language to create unit in
   * @param {*} filesToAdd files to add to new unit
   */
  const createUnit = async ( language, filesToAdd ) => {
    const { project: { projectTitle, tags } } = videoProject;
    const thumbnail = getLanguageThumbnail( language );

    return updateVideoProject( getQuery( projectId, {
      units: {
        create: buildUnit( projectTitle, language, getTagIds( tags ), filesToAdd, thumbnail )
      }
    } ) );
  };

  /**
   * Adds files to existing unit
   * @param {*} language language unit to add files
   * @param {*} filesToAdd files to add to unit
   */
  const addFilesToUnit = async ( unitId, filesToAdd ) => updateVideoUnit( getQuery( unitId, {
    files: {
      create: buildVideoFileTree( filesToAdd )
    }
  } ) );

  /**
   * Updates file properties of existing file
   * @param {*} file
   */
  const updateFile = async file => updateVideoFile( getQuery( file.id, {
    language: {
      connect: {
        id: file.language
      }
    },
    quality: file.quality,
    videoBurnedInStatus: file.videoBurnedInStatus,
    use: {
      connect: {
        id: file.use
      }
    }
  } ) );

  /**
   * Updates applicable units. If an existing file's language changes, diconnect that file
   * from its existing unit and connect to new unit. Create unit if a unit in the
   * file's new language does not yet exist
   * @param {object} file file to update
   */
  const updateUnit = async file => {
    const unitFileBelongsTo = getFileUnit( file );

    // 1. stored changed status before updating
    const fileLanguageChanged = hasFileLanguageChanged( unitFileBelongsTo, file );

    // 2. if changed, remove from current unit and add to new unit
    if ( fileLanguageChanged ) {
      // a. disconnect from current unit
      await disconnectFileFromUnit( unitFileBelongsTo, file );

      // b. does unit exist for new language?
      let unitOfLanguage = videoProject.project.units.find( u => u.language.id === file.language );

      // i. yes, unit exists, connect file to it
      if ( unitOfLanguage ) {
        return connectFileToUnit( unitOfLanguage, file );
      }

      // ii. no, unit does not exist, create unit and connect file to new unit
      const result = await createUnit( file.language );
      unitOfLanguage = result.data.updateVideoProject.units.find( u => u.language.id === file.language );

      return connectFileToUnit( unitOfLanguage, file );
    }
  };

  /**
   * Creates new files in project. Either adds files to existing language unit
   * or creates a unit if one in file language does not exist
   * @param {*} files Files to add to the project
   */
  const createFiles = files => {
    // 1. separate files by language
    const languages = separateFilesByLanguage( files );

    const entries = Object.entries( languages );
    const promises = entries.map( entry => {
      const [language, filesToAdd] = entry;
      const unitOfLanguage = videoProject.project.units.find( u => u.language.id === language );
      // 2. add files to exisiting unit
      if ( unitOfLanguage ) {
        return addFilesToUnit( unitOfLanguage.id, filesToAdd );
      }
      // 3. create new unit and add files
      return createUnit( language, filesToAdd );
    } );

    return Promise.all( promises );
  };

  /**
   * Removes any unit that does not have files
   * @param {array} unitsToRemove
   */
  const removeUnits = async unitsToRemove => {
    if ( unitsToRemove.length ) {
      const unitIds = unitsToRemove.map( u => u.id );

      try {
        const res = deleteManyVideoUnits( {
          variables: {
            where: {
              id_in: unitIds
            }
          }
        } );
        return res;
      } catch ( err ) {
        console.log( err );
      }
    }
  };

  const uploadFiles = async ( files = [] ) => {
    let uploadDir = null;

    return Promise.all( files.map( async file => {
      // 1. verify allowed file extension
      if ( !extensions.includes( getFileExt( file.name ) ) ) {
        throw new Error( `File: ${file.name} does not have an accepted support extension for this project` );
      }

      try {
        // 2. get upload path from existing files if possible
        if ( hasProjectUnits() ) {
          uploadDir = searchTreeForS3FileDirectories( videoProject.project.units );
          uploadDir = uploadDir.length ? uploadDir[0] : '';
        }

        // if new file use projectId to create new dir on S3, else use exisiting dir
        const projectIdPath = uploadDir || projectId;

        // 3. Upload file
        return uploadExecute( projectIdPath, [file] );
      } catch ( err ) {
        file.error = !!err;
        console.error( err );
      }
    } ) );
  };

  const removeFiles = async files => {
    const { deleteVideoFile } = props;
    return Promise.all( files.map( async file => deleteVideoFile( { variables: { id: file.id } } ) ) );
  };

  /**
   * Main save function
   * @param {array} files
   * @param {array} filesToRemove
   */
  const handleSave = async ( files, filesToRemove ) => {
    try {
      // remove files
      await removeFiles( filesToRemove );

      // // upload files
      const toUpload = files.filter( file => ( file.input ) );
      await uploadFiles( toUpload ).catch( err => console.log( err ) );

      // create new files
      await createFiles( toUpload );

      // update existing files
      const toUpdate = files.filter( file => ( !file.input ) );
      await Promise.all( toUpdate.map( file => updateFile( file ) ) );

      // update connect/disconnect existing files from units
      await Promise.all( toUpdate.map( file => updateUnit( file ) ) );

      // remove units
      const unitsToRemove = getUnitsToRemove( files, filesToRemove );
      await removeUnits( unitsToRemove );

      // update cache
      props.videoProject.refetch();
    } catch ( err ) {
      console.dir( err );
    }
  };

  const fetchUnits = () => {
    if ( hasProjectUnits() ) {
      return videoProject.project.units;
    }

    if ( hasFilesToUpload() ) {
      return getUnitsForNewProject();
    }

    return [];
  };

  const [units, setUnits] = useState( [] );
  const [projectFiles, setProjectFiles] = useState( [] );
  const [allowedFilesToUpload, setAllowedFilesToUpload] = useState( [] );

  useEffect( () => {
    setUnits( fetchUnits( videoProject ) );
    setProjectFiles( getFilesToEdit() );
    setAllowedFilesToUpload( getAllowedExtensions( filesToUpload ) );
  }, [] );

  useEffect( () => {
    if ( hasProjectUnits() ) {
      const { project } = videoProject;
      if ( project && project.units && project.units.length ) {
        setUnits( fetchUnits( videoProject ) );
        setProjectFiles( getFilesToEdit() );
      }
    }
  }, [videoProject] );


  const renderUnits = () => (
    <Card.Group>
      { units.map( unit => (
        <ProjectUnitItem
          key={ unit.language.id }
          unit={ unit }
          projectId={ projectId }
          filesToUpload={ allowedFilesToUpload }
        />
      ) ) }
    </Card.Group>
  );

  return (
    <div className="project-units">
      <h2 className="list-heading" style={ { marginBottom: '1rem' } }>{ heading }
        { projectId
          && (
            <EditProjectFiles
              title="Edit video files in this project"
              type="video"
              filesToEdit={ projectFiles }
              extensions={ ['.mov', '.mp4'] }
              save={ handleSave }
            />
          )
        }
      </h2>
      { units && units.length
        ? renderUnits( units )
        : 'No units available'
       }
    </div>
  );
};


ProjectUnits.propTypes = {
  languageList: PropTypes.object,
  projectId: PropTypes.string,
  heading: PropTypes.string,
  extensions: PropTypes.array,
  videoProject: PropTypes.object,
  filesToUpload: PropTypes.array, // from redux
  deleteVideoFile: PropTypes.func,
  updateVideoUnit: PropTypes.func,
  updateVideoProject: PropTypes.func,
  updateVideoFile: PropTypes.func,
  deleteManyVideoUnits: PropTypes.func,
  uploadExecute: PropTypes.func
};


const mapStateToProps = state => ( {
  filesToUpload: state.upload.filesToUpload
} );


export default compose(
  withFileUpload,
  connect( mapStateToProps ),
  graphql( LANGUAGES_QUERY, { name: 'languageList' } ),
  graphql( VIDEO_PROJECT_QUERY, {
    name: 'videoProject',
    options: props => ( {
      partialRefetch: true,
      variables: {
        id: props.projectId
      }
    } ),
    skip: props => !props.projectId
  } ),
  graphql( UPDATE_VIDEO_PROJECT_MUTATION, { name: 'updateVideoProject' } ),
  graphql( UPDATE_VIDEO_UNIT_MUTATION, { name: 'updateVideoUnit' } ),
  graphql( DELETE_MANY_VIDEO_UNITS_MUTATION, { name: 'deleteManyVideoUnits' } ),
  graphql( DELETE_VIDEO_FILE_MUTATION, { name: 'deleteVideoFile' } ),
  graphql( UPDATE_VIDEO_FILE_MUTATION, { name: 'updateVideoFile' } )
)( ProjectUnits );
