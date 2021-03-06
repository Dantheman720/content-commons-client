import React from 'react';
import PropTypes from 'prop-types';
import { setProjectTitle } from 'lib/graphql/util';
import './DeleteProjectsList.scss';

const DeleteProjectsList = props => {
  const { headline, isDrafts, projects } = props;

  return (
    <div className="list-container">
      <p id={ `delete-${isDrafts ? '' : 'non-'}drafts-desc` }>
        { headline }
      </p>
      <ul
        className="delete-list"
        aria-describedby={ `delete-${isDrafts ? '' : 'non-'}drafts-desc` }
      >
        { projects.map( project => (
          <li key={ project.id } className="delete-list-item">
            { setProjectTitle( project ) }
          </li>
        ) ) }
      </ul>
    </div>
  );
};

DeleteProjectsList.propTypes = {
  headline: PropTypes.string,
  isDrafts: PropTypes.bool,
  projects: PropTypes.array
};

DeleteProjectsList.defaultProps = {
  isDrafts: false,
  projects: []
};

export default DeleteProjectsList;
