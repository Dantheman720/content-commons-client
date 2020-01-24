import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { updateUrl } from 'lib/browser';
import { getCount, getPluralStringOrNot, getPreviewNotificationStyles } from 'lib/utils';
import { Card } from 'semantic-ui-react';

import DownloadPkgFiles from 'components/admin/download/DownloadPkgFiles/DownloadPkgFiles';
import MetaTerms from 'components/admin/MetaTerms/MetaTerms';
import ModalItem from 'components/modals/ModalItem/ModalItem';
import Notification from 'components/Notification/Notification';
import Popup from 'components/popups/Popup';
import PopupTrigger from 'components/popups/PopupTrigger';
import PopupTabbed from 'components/popups/PopupTabbed';
import Share from 'components/Share/Share';
import VisuallyHidden from 'components/VisuallyHidden/VisuallyHidden';

import downloadIcon from 'static/icons/icon_download.svg';
import shareIcon from 'static/icons/icon_share.svg';
import { getDateTimeTerms } from './PressPackageItem/PressPackageItem';
import PackageItem from './PackageItem/PackageItem';
import { normalizeDocumentItemByAPI } from './utils';

import './Package.scss';

const Package = props => {
  const { isAdminPreview, useGraphQl } = props;
  const {
    id,
    published,
    modified,
    type,
    title,
    site,
    packageFiles
  } = props.item;

  useEffect( () => {
    if ( !isAdminPreview ) {
      updateUrl( `/package?id=${id}&site=${site}&language=en-us` );
    }
  }, [] );

  return (
    <ModalItem
      className="package"
      headline={ title }
      textDirection="LTR" // use LTR since pkg have no lang field
    >
      {
        isAdminPreview && (
          <Notification
            el="p"
            show
            customStyles={ getPreviewNotificationStyles() }
            msg="This is a preview of your package on Content Commons."
          />
        )
      }
      <MetaTerms
        className="date-time"
        unitId={ id }
        terms={ getDateTimeTerms( published, modified, 'LT, l' ) }
      />

      <div className="modal_options">
        <div className="trigger-container">
          <PopupTrigger
            tooltip="Share package"
            icon={ { img: shareIcon, dim: 18 } }
            show
            content={ (
              <Popup title="Share this package.">
                <Share
                  id={ id }
                  isPreview={ isAdminPreview }
                  language="en-us" // use en since pkg have no lang field
                  link="The direct link to the package will appear here."
                  site={ site }
                  title={ title }
                  type="package"
                />
              </Popup>
            ) }
          />

          <PopupTrigger
            tooltip={ getPluralStringOrNot( packageFiles, 'Download file' ) }
            icon={ { img: downloadIcon, dim: 18 } }
            position="right"
            show
            content={ (
              <PopupTabbed
                title={ getPluralStringOrNot( packageFiles, 'Package File' ) }
                panes={ [
                  {
                    title: getPluralStringOrNot( packageFiles, 'Document' ),
                    component: (
                      <DownloadPkgFiles
                        files={ packageFiles }
                        instructions={ getPluralStringOrNot( packageFiles, 'Download Package File' ) }
                        isPreview
                      />
                    )
                  }
                ] }
              />
            ) }
          />
          <span className="file-count">
            { `(${getCount( packageFiles )})` }
            <VisuallyHidden> documents in this package</VisuallyHidden>
          </span>
        </div>
      </div>

      <div className="package-items">
        <Card.Group>
          { getCount( packageFiles )
            ? packageFiles.map( file => (
              <PackageItem
                key={ file.id }
                file={ normalizeDocumentItemByAPI( { file, useGraphQl } ) }
                type={ type }
                { ...( isAdminPreview ? { isAdminPreview } : '' ) }
              />
            ) )
            : 'There are no files associated with this package.' }
        </Card.Group>
      </div>
    </ModalItem>
  );
};

Package.propTypes = {
  isAdminPreview: PropTypes.bool,
  useGraphQl: PropTypes.bool,
  item: PropTypes.object,
};

export default Package;