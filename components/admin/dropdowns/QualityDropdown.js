import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

const VIDEO_QUALITY_QUERY = gql`
  query VIDEO_QUALITY_QUERY {
    __type(name: "VideoQuality"){
     enumValues {
       name
     }
    }
  }
 `;

const IMAGE_QUALITY_QUERY = gql`
query IMAGE_QUALITY_QUERY {
  __type(name: "ImageQuality"){
   enumValues {
     name
   }
  }
}
`;

const QualityDropdown = props => (
  <Query query={ props.type === 'video' ? VIDEO_QUALITY_QUERY : IMAGE_QUALITY_QUERY }>
    { ( { data, loading, error } ) => {
      if ( error ) return `Error! ${error.message}`;

      let options = [];

      if ( data && data.__type && data.__type.enumValues ) {
        options = data.__type.enumValues.map( quality => {
          const { name } = quality;
          return {
            key: name,
            text: `For ${name.toLowerCase()}`,
            value: name
          };
        } );
      }

      return (
        <Dropdown
          id={ props.id }
          name="quality"
          onChange={ props.onChange }
          options={ options }
          placeholder="–"
          value={ props.selected }
              // error={ !selectedLanguage }
          fluid
          selection
          loading={ loading }
        />

      );
    } }
  </Query>

);

QualityDropdown.propTypes = {
  id: PropTypes.string,
  selected: PropTypes.string,
  onChange: PropTypes.func,
  type: PropTypes.string,
};

export default QualityDropdown;
export { VIDEO_QUALITY_QUERY };
export { IMAGE_QUALITY_QUERY };
