import { mount } from 'enzyme';
import wait from 'waait';
import toJSON from 'enzyme-to-json';
import { MockedProvider } from 'react-apollo/test-utils';
import { getPluralStringOrNot } from 'lib/utils';
import DeleteProjects from './DeleteProjects';
import {
  mocks, drafts, nonDrafts, draftMocks
} from './mocks';

const props = {
  deleteConfirmOpen: false,
  handleActionResult: jest.fn(),
  handleDeleteCancel: jest.fn(),
  handleDeleteConfirm: jest.fn(),
  handleResetSelections: jest.fn(),
  deleteVideoProject: jest.fn(),
  selections: [...drafts, ...nonDrafts],
  showConfirmationMsg: jest.fn()
};

const openConfirmProps = {
  ...props,
  ...{ deleteConfirmOpen: true }
};

const nonDraftsProps = {
  ...props,
  ...{
    deleteConfirmOpen: true,
    selections: [...nonDrafts]
  }
};

const Component = (
  <MockedProvider mocks={ mocks } addTypename={ false }>
    <DeleteProjects { ...props } />
  </MockedProvider>
);

const OpenConfirmComponent = (
  <MockedProvider mocks={ mocks } addTypename={ false }>
    <DeleteProjects { ...openConfirmProps } />
  </MockedProvider>
);

const NonDraftsComponent = (
  <MockedProvider mocks={ mocks } addTypename={ false }>
    <DeleteProjects { ...nonDraftsProps } />
  </MockedProvider>
);

describe( '<DeleteProjects />', () => {
  it( 'renders without crashing', () => {
    const wrapper = mount( Component );
    const deleteMutation = wrapper.find( 'DeleteProjects' );

    expect( deleteMutation.exists() ).toEqual( true );
    expect( toJSON( deleteMutation ) ).toMatchSnapshot();
  } );

  it( 'renders a Confirm component', () => {
    const wrapper = mount( Component );
    const deleteMutation = wrapper.find( 'DeleteProjects' );
    const confirm = deleteMutation.find( 'Modal.delete' );

    expect( confirm.exists() ).toEqual( true );
  } );

  it( 'deleteConfirmOpen opens the Confirm component', () => {
    const wrapper = mount( OpenConfirmComponent );
    const deleteMutation = wrapper.find( 'DeleteProjects' );
    const confirm = deleteMutation.find( 'Modal.delete' );

    expect( confirm.prop( 'open' ) )
      .toEqual( openConfirmProps.deleteConfirmOpen );
  } );

  it( 'renders the correct heading and Confirm messages if both DRAFT and non-DRAFT projects are selected', () => {
    const wrapper = mount( OpenConfirmComponent );
    const deleteMutation = wrapper.find( 'DeleteProjects' );
    const confirmModalContent = deleteMutation.find( 'ConfirmModalContent' );
    const heading = `Are you sure you want to delete the selected DRAFT video ${getPluralStringOrNot( drafts, 'project' )}?`; // eslint-disable-line
    const msg1 = `The following DRAFT video ${getPluralStringOrNot( drafts, 'project' )} will be removed permanently from the Content Cloud:`;
    const msg2 = `${drafts.length > 0 && nonDrafts.length > 0 ? 'Only DRAFT video projects can be deleted from the dashboard. ' : ''}The following non-DRAFT video ${getPluralStringOrNot( nonDrafts, 'project' )} will NOT be removed:`;

    expect( confirmModalContent.contains( heading ) ).toEqual( true );
    expect( confirmModalContent.contains( msg1 ) ).toEqual( true );
    expect( confirmModalContent.contains( msg2 ) ).toEqual( true );
  } );

  it( 'renders the correct heading and Confirm messages if only non-DRAFT project(s) are selected', () => {
    const wrapper = mount( NonDraftsComponent );
    const deleteMutation = wrapper.find( 'DeleteProjects' );
    const confirmModalContent = deleteMutation.find( 'ConfirmModalContent' );
    const heading = 'Only DRAFT video projects can be deleted from the dashboard.';
    const msg = `The following non-DRAFT video ${getPluralStringOrNot( nonDrafts, 'project' )} will NOT be removed:`;

    expect( confirmModalContent.contains( heading ) ).toEqual( true );
    expect( confirmModalContent.contains( msg ) ).toEqual( true );
  } );

  it( 'clicking the cancel button calls handleDeleteCancel', () => {
    const wrapper = mount( OpenConfirmComponent );
    const deleteMutation = wrapper.find( 'DeleteProjects' );
    const confirm = deleteMutation.find( 'Modal.delete' );
    const cancelBtn = confirm.find( 'Button[content="No, take me back"]' );

    cancelBtn.simulate( 'click' );
    expect( props.handleDeleteCancel ).toHaveBeenCalled();
  } );

  it( 'clicking the confirm button calls handleActionResult with the apporpriate results', async () => {
    const wrapper = mount( OpenConfirmComponent );
    const deleteProjects = wrapper.find( 'DeleteProjects' );
    const confirm = deleteProjects.find( 'Modal.delete' );
    const confirmBtn = confirm.find( 'Button[content="Yes, delete forever"]' );

    confirmBtn.simulate( 'click' );
    await wait( 10 );
    wrapper.update();

    expect( props.handleActionResult ).toHaveBeenCalledTimes( drafts.length );
    const mockResults = draftMocks.map( mock => [mock.result] );
    expect( props.handleActionResult.mock.calls ).toEqual( expect.arrayContaining( mockResults ) );
  } );

  it( 'clicking the confirm button calls handleDeleteConfirm and handleDeleteCancel when completed', async () => {
    const wrapper = mount( OpenConfirmComponent );
    const deleteProjects = wrapper.find( 'DeleteProjects' );
    const confirm = deleteProjects.find( 'Modal.delete' );
    const confirmBtn = confirm.find( 'Button[content="Yes, delete forever"]' );

    confirmBtn.simulate( 'click' );
    await wait( 10 );
    wrapper.update();

    expect( props.handleDeleteConfirm ).toHaveBeenCalled();
    expect( props.handleDeleteCancel ).toHaveBeenCalled();
  } );
} );
