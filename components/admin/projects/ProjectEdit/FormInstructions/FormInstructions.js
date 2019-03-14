/**
 *
 * FormInstructions
 *
 */

import React, { Fragment } from 'react';
// import PropTypes from 'prop-types';

const FormInstructions = () => {
  const baseStyles = {
    margin: '0',
    padding: '0.625em 1.75em',
    backgroundColor: '#d6d7d9',
    textAlign: 'center'
  };

  const draftMsgStyles = {
    ...baseStyles,
    padding: '0.625em 1.75em 1.5em',
    backgroundColor: '#fff'
  };

  return (
    <Fragment>
      <p style={ baseStyles }>
        <strong>Fill out the required fields to finish setting up this project.</strong>
      </p>
      <p style={ draftMsgStyles }>Your files will not be uploaded until the project is saved as a draft.
      </p>
    </Fragment>
  );
};

FormInstructions.propTypes = {};

export default FormInstructions;
