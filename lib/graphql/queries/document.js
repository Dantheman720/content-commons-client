import gql from 'graphql-tag';
import {
  IMAGE_DETAILS_FRAGMENT,
  LANGUAGE_DETAILS_FRAGMENT,
  CATEGORY_DETAILS_FRAGMENT,
  TAG_DETAILS_FRAGMENT
} from './common';

/*----------------------------------------
 Fragments
 -----------------------------------------*/
export const DOCUMENT_DETAILS_FRAGMENT = gql`
  fragment documentDetails on DocumentFile {
    id
    createdAt
    updatedAt
    publishedAt
    title
    filename
    filetype
    filesize
    status
    visibility
    url
    signedUrl
    content {
      id
      rawText
      html
    }
    use {
      id
      name
    }
    bureaus {
      id
      name
      abbr
      offices {
        id
        name
        abbr
      }
    }
    image {
      ...imageDetails
    }
    language {
      ...languageDetails
    }
    categories {
      ...categoryDetails
    }
    tags {
      ...tagDetails
    }
  }
  ${LANGUAGE_DETAILS_FRAGMENT}
  ${TAG_DETAILS_FRAGMENT}
  ${CATEGORY_DETAILS_FRAGMENT}
  ${IMAGE_DETAILS_FRAGMENT}
`;

/*----------------------------------------
 Mutations
 -----------------------------------------*/
export const UPDATE_DOCUMENT_FILE_MUTATION = gql`
  mutation UPDATE_DOCUMENT_FILE_MUTATION(
    $data: DocumentFileUpdateInput!
    $where: DocumentFileWhereUniqueInput!
  ) {
    updateDocumentFile(data: $data, where: $where) {
      ...documentDetails
    }
  }
  ${DOCUMENT_DETAILS_FRAGMENT}
`;

export const DELETE_DOCUMENT_FILE_MUTATION = gql`
  mutation DELETE_DOCUMENT_FILE_MUTATION($id: ID!) {
    deleteDocumentFile(id: $id) {
      id
    }
  }
`;

/*----------------------------------------
 Queries
 -----------------------------------------*/
export const DOCUMENT_FILE_QUERY = gql`
  query DocumentFile($id: ID!) {
    documentFile(id: $id) {
      id
      title
      filename
      image {
        ...imageDetails
      }
    }
  }
  ${IMAGE_DETAILS_FRAGMENT}
`;
