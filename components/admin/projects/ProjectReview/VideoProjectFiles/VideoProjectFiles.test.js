import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import Router from 'next/router';
import { MockedProvider } from 'react-apollo/test-utils';
import { Icon, Loader } from 'semantic-ui-react';
import { VIDEO_PROJECT_PREVIEW_QUERY } from 'components/admin/projects/ProjectEdit/PreviewProjectContent/PreviewProjectContent';
import VideoProjectFiles from './VideoProjectFiles';

const props = { id: '123' };

const mocks = [
  {
    request: {
      query: VIDEO_PROJECT_PREVIEW_QUERY,
      variables: { id: props.id, isReviewPage: true }
    },
    result: {
      data: {
        project: {
          id: '123',
          units: [
            {
              id: 'eng931',
              title: 'Made in America',
              descPublic: 'A public description (English)',
              thumbnails: [
                {
                  image: {
                    alt: 'A man wearing a hardhat walks through an empty factory.',
                    url: 'https://staticcdp.s3.amazonaws.com/2018/05/courses.america.gov_1481/b3b38d194ff80d06dd837f57a41fe16f.jpg'
                  }
                }
              ],
              files: [
                {
                  id: 'eng183',
                  filename: 'madeinamerica_english.mp4',
                  url: 'https://video-download-url.com',
                  use: {
                    name: 'Full Video'
                  },
                  filesize: 662595174,
                  videoBurnedInStatus: 'CLEAN',
                  createdAt: '2019-03-20T15:09:24.975Z',
                  updatedAt: '2019-04-02T16:28:31.888Z',
                  quality: 'WEB',
                  duration: 556000,
                  dimensions: {
                    width: 1920,
                    height: 1080
                  },
                  stream: [
                    {
                      site: 'YouTube',
                      url: 'https://www.youtube.com/watch?1evw4fRu3bo',
                      embedUrl: 'https://www.youtube.com/embed/1evw4fRu3bo'
                    },
                    {
                      site: 'Vimeo',
                      url: 'https://vimeo.com/827301171',
                      embedUrl: 'https://player.vimeo.com/video/827301171'
                    }
                  ],
                  language: {
                    displayName: 'English',
                    textDirection: 'LTR'
                  }
                }
              ]
            },
            {
              id: 'fr0381',
              title: 'Fabriqué en Amérique',
              descPublic: 'A public description (French)',
              thumbnails: [
                {
                  image: {
                    alt: 'A man wearing a hardhat walks through an empty factory.',
                    url: 'https://staticcdp.s3.amazonaws.com/2018/05/courses.america.gov_1481/b3b38d194ff80d06dd837f57a41fe16f.jpg'
                  }
                }
              ],
              files: [
                {
                  id: 'fr1911',
                  filename: 'madeinamerica_french.mp4',
                  url: 'https://video-download-url.com',
                  use: {
                    name: 'Full Video'
                  },
                  filesize: 662595174,
                  videoBurnedInStatus: 'CLEAN',
                  createdAt: '2019-03-20T15:09:24.975Z',
                  updatedAt: '2019-04-02T16:28:31.888Z',
                  quality: 'WEB',
                  duration: 556000,
                  dimensions: {
                    width: 1920,
                    height: 1080
                  },
                  stream: [
                    {
                      site: 'Vimeo',
                      url: 'https://vimeo.com/827301171',
                      embedUrl: 'https://player.vimeo.com/video/827301171'
                    }
                  ],
                  language: {
                    displayName: 'French',
                    textDirection: 'LTR'
                  },
                }
              ]
            }
          ]
        }
      }
    }
  }
];

const Component = (
  <MockedProvider mocks={ mocks } addTypename={ false }>
    <VideoProjectFiles { ...props } />
  </MockedProvider>
);

describe( '<VideoProjectFiles />', () => {
  it( 'renders initial loading state without crashing', () => {
    const wrapper = mount( Component );
    const videoProjectFiles = wrapper.find( 'VideoProjectFiles' );
    const loader = (
      <Loader
        active
        inline="centered"
        style={ { marginBottom: '1em' } }
        content="Loading project file(s)..."
      />
    );

    expect( videoProjectFiles.exists() ).toEqual( true );
    expect( videoProjectFiles.contains( loader ) ).toEqual( true );
    expect( toJSON( videoProjectFiles ) ).toMatchSnapshot();
  } );

  it( 'renders error message & icon if error is thrown', async () => {
    const errorMocks = [
      {
        request: {
          query: VIDEO_PROJECT_PREVIEW_QUERY,
          variables: { id: props.id, isReviewPage: true }
        },
        result: {
          errors: [{ message: 'There was an error.' }]
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={ errorMocks }>
        <VideoProjectFiles { ...props } />
      </MockedProvider>
    );
    // wait for the data and !loading
    await wait( 0 );
    wrapper.update();

    const videoProjectFiles = wrapper.find( 'VideoProjectFiles' );
    const div = videoProjectFiles
      .find( 'div.video-project-files.error' );
    const icon = <Icon color="red" name="exclamation triangle" />;
    const span = <span>Loading error...</span>;

    expect( div.exists() ).toEqual( true );
    expect( videoProjectFiles.contains( icon ) )
      .toEqual( true );
    expect( videoProjectFiles.contains( span ) )
      .toEqual( true );
  } );

  it( 'renders `null` if project is `null`', async () => {
    const nullMocks = [
      {
        request: {
          query: VIDEO_PROJECT_PREVIEW_QUERY,
          variables: { id: props.id, isReviewPage: true }
        },
        result: {
          data: { project: null }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={ nullMocks }>
        <VideoProjectFiles { ...props } />
      </MockedProvider>
    );
    await wait( 0 );
    wrapper.update();

    const videoProjectFiles = wrapper.find( 'VideoProjectFiles' );

    expect( videoProjectFiles.html() ).toEqual( null );
  } );

  it( 'renders the final state', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const videoProjectFiles = wrapper.find( 'VideoProjectFiles' );

    expect( toJSON( videoProjectFiles ) ).toMatchSnapshot();
  } );

  it( 'clicking the Edit button redirects to <VideoEdit />', async () => {
    const wrapper = mount( Component );
    await wait( 0 );
    wrapper.update();

    const videoProjectFiles = wrapper.find( 'VideoProjectFiles' );
    const header = videoProjectFiles.find( '.project_file_header' );
    const editBtns = header.find( 'Button.project_button--edit' );
    Router.push = jest.fn();

    editBtns.forEach( btn => {
      btn.simulate( 'click' );
      expect( Router.push ).toHaveBeenCalledWith( {
        pathname: `/admin/project/video/${props.id}/edit`
      } );
    } );
  } );

  it( 'renders `null` if units is `null`', async () => {
    const nullUnitsMocks = [
      {
        request: {
          query: VIDEO_PROJECT_PREVIEW_QUERY,
          variables: { id: props.id, isReviewPage: true }
        },
        result: {
          data: {
            project: {
              id: '123',
              units: null
            }
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={ nullUnitsMocks } addTypename={ false }>
        <VideoProjectFiles { ...props } />
      </MockedProvider>
    );
    await wait( 0 );
    wrapper.update();

    const videoProjectFiles = wrapper.find( 'VideoProjectFiles' );

    expect( videoProjectFiles.exists() ).toEqual( true );
    expect( videoProjectFiles.html() ).toEqual( null );
  } );

  it( 'renders `null` if units is `[]`', async () => {
    const emptyUnitsMocks = [
      {
        request: {
          query: VIDEO_PROJECT_PREVIEW_QUERY,
          variables: { id: props.id, isReviewPage: true }
        },
        result: {
          data: {
            project: {
              id: '123',
              units: []
            }
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={ emptyUnitsMocks } addTypename={ false }>
        <VideoProjectFiles { ...props } />
      </MockedProvider>
    );
    await wait( 0 );
    wrapper.update();

    const videoProjectFiles = wrapper.find( 'VideoProjectFiles' );

    expect( videoProjectFiles.exists() ).toEqual( true );
    expect( videoProjectFiles.html() ).toEqual( null );
  } );

  it( 'does not render div.project_file if unit.files is `null`', async () => {
    const nullFilesMocks = [
      {
        request: {
          query: VIDEO_PROJECT_PREVIEW_QUERY,
          variables: { id: props.id, isReviewPage: true }
        },
        result: {
          data: {
            project: {
              id: '123',
              units: [
                {
                  id: 'eng931',
                  title: 'Made in America',
                  descPublic: 'A public description (English)',
                  thumbnails: [
                    {
                      image: {
                        alt: 'A man wearing a hardhat walks through an empty factory.',
                        url: 'https://staticcdp.s3.amazonaws.com/2018/05/courses.america.gov_1481/b3b38d194ff80d06dd837f57a41fe16f.jpg'
                      }
                    }
                  ],
                  files: null
                },
                {
                  id: 'fr0381',
                  title: 'Fabriqué en Amérique',
                  descPublic: 'A public description (French)',
                  thumbnails: [
                    {
                      image: {
                        alt: 'A man wearing a hardhat walks through an empty factory.',
                        url: 'https://staticcdp.s3.amazonaws.com/2018/05/courses.america.gov_1481/b3b38d194ff80d06dd837f57a41fe16f.jpg'
                      }
                    }
                  ],
                  files: null
                }
              ]
            }
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={ nullFilesMocks } addTypename={ false }>
        <VideoProjectFiles { ...props } />
      </MockedProvider>
    );
    await wait( 0 );
    wrapper.update();

    const videoProjectFiles = wrapper.find( 'VideoProjectFiles' );
    const projectFile = videoProjectFiles.find( 'div.project_file' );

    expect( videoProjectFiles.exists() ).toEqual( true );
    expect( projectFile.exists() ).toEqual( false );
  } );

  it( 'does not render div.project_file if unit.files is `[]`', async () => {
    const emptyFilesMocks = [
      {
        request: {
          query: VIDEO_PROJECT_PREVIEW_QUERY,
          variables: { id: props.id, isReviewPage: true }
        },
        result: {
          data: {
            project: {
              id: '123',
              units: [
                {
                  id: 'eng931',
                  title: 'Made in America',
                  descPublic: 'A public description (English)',
                  thumbnails: [
                    {
                      image: {
                        alt: 'A man wearing a hardhat walks through an empty factory.',
                        url: 'https://staticcdp.s3.amazonaws.com/2018/05/courses.america.gov_1481/b3b38d194ff80d06dd837f57a41fe16f.jpg'
                      }
                    }
                  ],
                  files: []
                },
                {
                  id: 'fr0381',
                  title: 'Fabriqué en Amérique',
                  descPublic: 'A public description (French)',
                  thumbnails: [
                    {
                      image: {
                        alt: 'A man wearing a hardhat walks through an empty factory.',
                        url: 'https://staticcdp.s3.amazonaws.com/2018/05/courses.america.gov_1481/b3b38d194ff80d06dd837f57a41fe16f.jpg'
                      }
                    }
                  ],
                  files: []
                }
              ]
            }
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={ emptyFilesMocks } addTypename={ false }>
        <VideoProjectFiles { ...props } />
      </MockedProvider>
    );
    await wait( 0 );
    wrapper.update();

    const videoProjectFiles = wrapper.find( 'VideoProjectFiles' );
    const projectFile = videoProjectFiles.find( 'div.project_file' );

    expect( videoProjectFiles.exists() ).toEqual( true );
    expect( projectFile.exists() ).toEqual( false );
  } );

  it( 'does not render the thumbnail if unit.thumbnails is `null`', async () => {
    const nullThumbnailsMocks = [
      {
        request: {
          query: VIDEO_PROJECT_PREVIEW_QUERY,
          variables: { id: props.id, isReviewPage: true }
        },
        result: {
          data: {
            project: {
              id: '123',
              units: [
                {
                  id: 'eng931',
                  title: 'Made in America',
                  descPublic: 'A public description (English)',
                  thumbnails: null,
                  files: [
                    {
                      id: 'eng183',
                      filename: 'madeinamerica_english.mp4',
                      url: 'https://video-download-url.com',
                      use: {
                        name: 'Full Video'
                      },
                      filesize: 662595174,
                      videoBurnedInStatus: 'CLEAN',
                      createdAt: '2019-03-20T15:09:24.975Z',
                      updatedAt: '2019-04-02T16:28:31.888Z',
                      quality: 'WEB',
                      duration: 556000,
                      dimensions: {
                        width: 1920,
                        height: 1080
                      },
                      stream: [
                        {
                          site: 'YouTube',
                          url: 'https://www.youtube.com/watch?1evw4fRu3bo',
                          embedUrl: 'https://www.youtube.com/embed/1evw4fRu3bo'
                        },
                        {
                          site: 'Vimeo',
                          url: 'https://vimeo.com/827301171',
                          embedUrl: 'https://player.vimeo.com/video/827301171'
                        }
                      ],
                      language: {
                        displayName: 'English',
                        textDirection: 'LTR'
                      }
                    }
                  ]
                },
                {
                  id: 'fr0381',
                  title: 'Fabriqué en Amérique',
                  descPublic: 'A public description (French)',
                  thumbnails: null,
                  files: [
                    {
                      id: 'fr1911',
                      filename: 'madeinamerica_french.mp4',
                      url: 'https://video-download-url.com',
                      use: {
                        name: 'Full Video'
                      },
                      filesize: 662595174,
                      videoBurnedInStatus: 'CLEAN',
                      createdAt: '2019-03-20T15:09:24.975Z',
                      updatedAt: '2019-04-02T16:28:31.888Z',
                      quality: 'WEB',
                      duration: 556000,
                      dimensions: {
                        width: 1920,
                        height: 1080
                      },
                      stream: [
                        {
                          site: 'Vimeo',
                          url: 'https://vimeo.com/827301171',
                          embedUrl: 'https://player.vimeo.com/video/827301171'
                        }
                      ],
                      language: {
                        displayName: 'French',
                        textDirection: 'LTR'
                      },
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={ nullThumbnailsMocks } addTypename={ false }>
        <VideoProjectFiles { ...props } />
      </MockedProvider>
    );
    await wait( 0 );
    wrapper.update();

    const videoProjectFiles = wrapper.find( 'VideoProjectFiles' );
    const fileMeta = videoProjectFiles.find( '.file_meta' );
    const thumbnail = fileMeta.find( 'img' );

    expect( videoProjectFiles.exists() ).toEqual( true );
    expect( thumbnail.exists() ).toEqual( false );
  } );

  it( 'does not render the thumbnail if unit.thumbnails is `[]`', async () => {
    const emptyThumbnailsMocks = [
      {
        request: {
          query: VIDEO_PROJECT_PREVIEW_QUERY,
          variables: { id: props.id, isReviewPage: true }
        },
        result: {
          data: {
            project: {
              id: '123',
              units: [
                {
                  id: 'eng931',
                  title: 'Made in America',
                  descPublic: 'A public description (English)',
                  thumbnails: [],
                  files: [
                    {
                      id: 'eng183',
                      filename: 'madeinamerica_english.mp4',
                      url: 'https://video-download-url.com',
                      use: {
                        name: 'Full Video'
                      },
                      filesize: 662595174,
                      videoBurnedInStatus: 'CLEAN',
                      createdAt: '2019-03-20T15:09:24.975Z',
                      updatedAt: '2019-04-02T16:28:31.888Z',
                      quality: 'WEB',
                      duration: 556000,
                      dimensions: {
                        width: 1920,
                        height: 1080
                      },
                      stream: [
                        {
                          site: 'YouTube',
                          url: 'https://www.youtube.com/watch?1evw4fRu3bo',
                          embedUrl: 'https://www.youtube.com/embed/1evw4fRu3bo'
                        },
                        {
                          site: 'Vimeo',
                          url: 'https://vimeo.com/827301171',
                          embedUrl: 'https://player.vimeo.com/video/827301171'
                        }
                      ],
                      language: {
                        displayName: 'English',
                        textDirection: 'LTR'
                      }
                    }
                  ]
                },
                {
                  id: 'fr0381',
                  title: 'Fabriqué en Amérique',
                  descPublic: 'A public description (French)',
                  thumbnails: [],
                  files: [
                    {
                      id: 'fr1911',
                      filename: 'madeinamerica_french.mp4',
                      url: 'https://video-download-url.com',
                      use: {
                        name: 'Full Video'
                      },
                      filesize: 662595174,
                      videoBurnedInStatus: 'CLEAN',
                      createdAt: '2019-03-20T15:09:24.975Z',
                      updatedAt: '2019-04-02T16:28:31.888Z',
                      quality: 'WEB',
                      duration: 556000,
                      dimensions: {
                        width: 1920,
                        height: 1080
                      },
                      stream: [
                        {
                          site: 'Vimeo',
                          url: 'https://vimeo.com/827301171',
                          embedUrl: 'https://player.vimeo.com/video/827301171'
                        }
                      ],
                      language: {
                        displayName: 'French',
                        textDirection: 'LTR'
                      },
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    ];

    const wrapper = mount(
      <MockedProvider mocks={ emptyThumbnailsMocks } addTypename={ false }>
        <VideoProjectFiles { ...props } />
      </MockedProvider>
    );
    await wait( 0 );
    wrapper.update();

    const videoProjectFiles = wrapper.find( 'VideoProjectFiles' );
    const fileMeta = videoProjectFiles.find( '.file_meta' );
    const thumbnail = fileMeta.find( 'img' );

    expect( videoProjectFiles.exists() ).toEqual( true );
    expect( thumbnail.exists() ).toEqual( false );
  } );
} );