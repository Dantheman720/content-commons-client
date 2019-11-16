import React from 'react';
import PropTypes from 'prop-types';
import { Form, Grid } from 'semantic-ui-react';
// remove sortBy after GraphQL is implemented
import sortBy from 'lodash/sortBy';
import { getCount, getFileNameNoExt } from 'lib/utils';
import CategoryDropdown from 'components/admin/dropdowns/CategoryDropdown/CategoryDropdown';
import TagDropdown from 'components/admin/dropdowns/TagDropdown/TagDropdown';
import VisibilityDropdown from 'components/admin/dropdowns/VisibilityDropdown/VisibilityDropdown';
// import test data for UI dev; remove after GraphQL is implemented
import { bureaus } from 'components/admin/dropdowns/BureauOfficesDropdown/mocks';
import './PressPackageFile.scss';

const PressPackageFile = props => {
  const {
    id, filename, filetype, image
  } = props.unit;

  const fileNameNoExt = getFileNameNoExt( filename );

  // for UI dev; remove after GraphQL is implemented
  let options = [];
  if ( bureaus ) {
    options = sortBy( bureaus, bureau => bureau.name )
      .map( bureau => ( { key: bureau.id, text: bureau.name, value: bureau.id } ) );
  }

  return (
    <div id={ id } className="package-file">
      <Grid>
        <Grid.Row>
          <Grid.Column mobile={ 16 } tablet={ 4 } computer={ 4 } className="thumbnail">
            { getCount( image ) && image[0].signedUrl
              ? <img src={ image[0].signedUrl } alt={ image[0].alt } />
              : <div className="placeholder" /> }
          </Grid.Column>

          <Grid.Column mobile={ 16 } tablet={ 12 } computer={ 12 } className="meta">
            <div className="data">
              <dl>
                <div>
                  <dt id="file-name">File Name</dt>
                  <dd role="definition" aria-labelledby="file-name">
                    { fileNameNoExt || filename }
                  </dd>
                </div>

                <div>
                  <dt id="release-type">Release Type</dt>
                  <dd role="definition" aria-labelledby="release-type">
                    { filetype }
                  </dd>
                </div>

                <div>
                  <dt id="page-count">Pages</dt>
                  <dd role="definition" aria-labelledby="page-count">TBD</dd>
                </div>
              </dl>
            </div>

            <div className="form-fields">
              <Form.Group widths="equal">
                <Form.Field>
                  <VisibilityDropdown
                    id="visibility"
                    name="visibility"
                    label="Visibility Setting"
                    value="INTERNAL"
                    onChange={ () => {} }
                    // error={ touched.visibility && !!errors.visibility }
                  />
                </Form.Field>

                <Form.Field>
                  <CategoryDropdown
                    id="categories"
                    name="categories"
                    label="Categories"
                    // value={ values.categories }
                    onChange={ () => {} }
                    // error={ touched.categories && !!errors.categories }
                    multiple
                    search
                    closeOnBlur
                    closeOnChange
                    required
                  />
                  <p className="field__helper-text">Select up to 2.</p>
                </Form.Field>
              </Form.Group>

              <Form.Group widths="equal">
                <Form.Field>
                  { /**
                     * for UI dev;
                     * replace with <BureauOfficesDropdown />
                     * after GraphQL is implemented
                     */ }
                  <Form.Dropdown
                    id="bureaus"
                    label="Author Bureaus/Offices"
                    name="bureaus"
                    options={ options }
                    placeholder="–"
                    fluid
                    selection
                    required
                  />
                  <p className="field__helper-text">Enter keywords separated by commas.</p>
                </Form.Field>

                <Form.Field>
                  <TagDropdown
                    id="tags"
                    label="Tags"
                    name="tags"
                    // value={ values.tags }
                    onChange={ () => {} }
                  />
                  <p className="field__helper-text">Enter keywords separated by commas.</p>
                </Form.Field>
              </Form.Group>
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
};

PressPackageFile.propTypes = {
  unit: PropTypes.object
};

export default PressPackageFile;
