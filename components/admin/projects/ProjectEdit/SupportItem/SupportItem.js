/**
 *
 * SupportItem
 *
 */
import React, {
  Fragment, useState, useEffect, useRef, useContext
} from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import { Button, Loader, Popup } from 'semantic-ui-react';
import debounce from 'lodash/debounce';
import iconRemove from 'static/icons/icon_remove.svg';
import iconReplace from 'static/icons/icon_replace.svg';
import Focusable from 'components/Focusable/Focusable';
import VisuallyHidden from 'components/VisuallyHidden/VisuallyHidden';
import { LANGUAGES_QUERY } from 'components/admin/dropdowns/LanguageDropdown';
import { getPathToS3Bucket } from 'lib/utils';
import { UploadContext } from '../VideoEdit/VideoEdit';

import './SupportItem.scss';

const GeneralError = dynamic( () => import( /* webpackChunkName: "generalError" */ 'components/errors/GeneralError/GeneralError' ) );

/* eslint-disable react/prefer-stateless-function */
const SupportItem = props => {
  const STR_INDEX_PROPORTION = 0.04;
  const ITEM_NAME_PROPORTION = 0.625;
  const ITEM_LANG_PROPORTION = 0.3;
  const DELAY_INTERVAL = 1000;

  const listEl = useRef( null );
  const filenameEl = useRef( null );
  const languageEl = useRef( null );
  const mounted = useRef( true );

  const uploadInProgress = useContext( UploadContext );

  const [error, setError] = useState( false );
  const [widths, setWidths] = useState( {
    listItem: 0,
    itemName: 0,
    itemLang: 0
  } );

  const { item } = props;
  const { listItem, itemName, itemLang } = widths;

  const updateWidths = () => {
    if ( mounted.current ) {
      setWidths( {
        listItem: listEl.current.offsetWidth,
        itemName: filenameEl.current.offsetWidth,
        itemLang: languageEl.current.offsetWidth
      } );
    }
  };

  const debounceResize = debounce( updateWidths, DELAY_INTERVAL );

  const getFileUrlStatus = async () => {
    const url = `${getPathToS3Bucket()}/${item.url}`;
    const status = await axios.get( url )
      .then( response => setError( response && response.status !== 200 ) )
      .catch( err => setError( err && err.isAxiosError ) );
    return status;
  };

  useEffect( () => {
    window.addEventListener( 'resize', debounceResize );
    updateWidths();
    getFileUrlStatus();

    return () => {
      window.removeEventListener( 'resize', debounceResize );
      mounted.current = false;
    };
  }, [] );


  /**
   * Truncates long strings with ellipsis
   * @param {string} str the string
   * @param {number} start index for first cutoff point
   * @param {number} end index for ending cutoff point
   * @return truncated string
   */
  const getShortFileName = ( str, index ) => (
    <Fragment>
      { `${str.substr( 0, index )}` }&hellip;{ `${str.substr( -index )}` }
    </Fragment>
  );

  /**
   * Determines an integer proportional
   * to a reference number
   * @param {number} reference
   * @return {number}
   */
  const getProportionalNumber = ( reference, proportion ) => (
    Math.floor( reference * proportion )
  );

  const isLongName = ( itemWidth, reference, proportion ) => (
    itemWidth >= getProportionalNumber( reference, proportion )
  );


  const normalizeLanguage = lang => {
    if ( typeof ( lang ) === 'string' ) { // will be object if coming from graphql
      return props.data.languages.filter( l => l.id === lang )[0];
    }
    return lang;
  };

  const normalizeItem = ( prop, defaultValue ) => {
    const fileProp = item[prop];

    if ( fileProp ) {
      return fileProp;
    } if ( item.input ) {
      return item.input[prop.replace( 'file', '' )];
    }
    return defaultValue;
  };

  const filename = normalizeItem( 'filename', '' );
  const filesize = normalizeItem( 'filesize', 0 );
  const language = normalizeLanguage( item.language );
  const charIndex = getProportionalNumber( listItem, STR_INDEX_PROPORTION );
  const shortFileName = getShortFileName( filename, charIndex );
  const isLongFileName = isLongName( itemName, listItem, ITEM_NAME_PROPORTION );
  const isLongLangName = isLongName( itemLang, listItem, ITEM_LANG_PROPORTION );
  const isUploading = uploadInProgress && ( item.loaded < filesize );

  const popupStyle = {
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    msWordBreak: 'break-all',
    wordBreak: 'break-word'
  };

  const renderName = ( str = '', isLang = false ) => {
    if ( isLongFileName ) {
      return (
        <Popup
          content={ str }
          size="mini"
          inverted
          on={ [
            'hover',
            'click',
            'focus'
          ] }
          trigger={ (
            <span>
              <Focusable>
                { isLang ? str : shortFileName }
              </Focusable>
            </span>
            ) }
          style={ popupStyle }
        />
      );
    }
    return str;
  };

  return (
    <li
      key={ `${item.id}-${language.id}` }
      className={ `support-item ${( item.loaded < filesize ) ? 'new' : ''}` }
      ref={ listEl }
    >
      <span className="item-name" style={ error ? { color: '#cd2026' } : {} }>
        { isLongFileName && <VisuallyHidden>{ filename }</VisuallyHidden> }
        <span
          className={
            `item-name-wrap${isLongFileName ? ' hasEllipsis' : ''}`
          }
          aria-hidden={ isLongFileName }
          ref={ filenameEl }
        >
          { error
            ? <GeneralError msg={ renderName( filename ) } />
            : renderName( filename ) }
        </span>

        <Loader active={ isUploading } inline size="mini" style={ { marginLeft: '.5rem' } } />

      </span>

      <span className={ `item-lang${error ? ' error' : ''}` }>
        { error
          ? (
            <Button.Group
              basic
              className="actions"
              size="mini"
              style={ { border: 'none' } }
            >
              <Popup
                trigger={ (
                  <Button className="replace" style={ { marginRight: 0, padding: '0.25rem' } }>
                    <img src={ iconReplace } alt="replace icon" />
                  </Button>
                ) }
                content="Replace this file"
                hideOnScroll
                inverted
                on={ ['hover', 'focus'] }
                size="mini"
              />
              <Popup
                trigger={ (
                  <Button className="delete" style={ { border: 'none', padding: '0.25rem' } }>
                    <img src={ iconRemove } alt="delete icon" />
                  </Button>
                ) }
                content="Delete this file"
                hideOnScroll
                inverted
                on={ ['hover', 'focus'] }
                size="mini"
              />
            </Button.Group>
          )
          : (
            <b
              className={
                `item-lang-wrap${isLongLangName ? ' hasEllipsis' : ''}`
              }
              ref={ languageEl }
            >
              { renderName( language.displayName, true ) }
            </b>
          ) }
      </span>
    </li>
  );
};


SupportItem.propTypes = {
  item: PropTypes.object,
  data: PropTypes.object
};

export default compose(
  graphql( LANGUAGES_QUERY )
)( SupportItem );
