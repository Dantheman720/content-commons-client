import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';
import MyProjectPrimaryCol from 'components/admin/Dashboard/MyProjects/MyProjectPrimaryCol/MyProjectPrimaryCol';
import TableMobileDataToggleIcon from 'components/ScrollableTableWithMenu/TableMobileDataToggleIcon/TableMobileDataToggleIcon';

const TableRow = props => {
  const [displayMobileData, setDisplayMobileData] = useState( false );

  const handleDisplayMobileData = () => {
    setDisplayMobileData( prevDisplayMobileData => !prevDisplayMobileData );
  };

  const {
    d, selectedItems, tableHeaders, toggleItemSelection
  } = props;

  if ( !d ) return null;

  return (
    <Table.Row
      className={ `${d.isNew ? 'myProjects_newItem' : ''} ${displayMobileData ? 'activeTableRow' : ''}` }
    >
      { tableHeaders.map( ( header, i ) => (
        <Table.Cell
          data-header={ header.label }
          key={ `${d.id}_${header.name}` }
          className="items_table_item"
        >
          { i === 0
            ? (
              // Table must include .primary_col div for fixed column
              <Fragment>
                <div className="primary_col">
                  <MyProjectPrimaryCol
                    d={ d }
                    header={ header }
                    selectedItems={ selectedItems }
                    toggleItemSelection={ toggleItemSelection }
                  />
                </div>
                <TableMobileDataToggleIcon
                  isOpen={ displayMobileData }
                  toggleDisplay={ handleDisplayMobileData }
                />
              </Fragment>
            )
            : (
              <Fragment>
                <span>
                  <div className="items_table_mobileHeader">{ header.label }</div>
                  { d[header.name] }
                </span>
                <br />
                { header.label === 'MODIFIED'
                  ? <span>{ d.status }</span>
                  : null }
              </Fragment>
            ) }
        </Table.Cell>
      ) ) }
    </Table.Row>
  );
};

TableRow.propTypes = {
  d: PropTypes.object,
  selectedItems: PropTypes.object,
  tableHeaders: PropTypes.array,
  toggleItemSelection: PropTypes.func
};

export default TableRow;
