import App, { Container } from 'next/app';
import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';
import withRedux from 'next-redux-wrapper';
import isEmpty from 'lodash/isEmpty';
import { isRestrictedPage, checkForAuthenticatedUser } from 'lib/authentication';
import { redirectTo } from 'lib/browser';
import withApollo from 'hocs/withApollo';
import Page from 'components/Page';
import makeStore from 'lib/redux/store';
import 'styles/styles.scss';

class Commons extends App {
  static async getInitialProps( { Component, ctx } ) {
    let pageProps = {};
    if ( Component.getInitialProps ) {
      pageProps = await Component.getInitialProps( ctx );
    }

    let authenticatedUser = null;
    // If on a restricted page, check for authenticated user
    if ( isRestrictedPage( ctx.pathname ) ) {
      authenticatedUser = await checkForAuthenticatedUser( ctx.apolloClient );

      if ( !authenticatedUser ) {
        // we don't have an authenticated user, redirect to login page
        redirectTo( '/login', { res: ctx.res } );
      }
    }

    // exposes apollo query to component
    if ( !isEmpty( ctx.query ) ) {
      pageProps.query = ctx.query;
    }

    return { pageProps };
  }

  render() {
    const {
      Component, apollo, store, pageProps
    } = this.props;

    return (
      <Container>
        <ApolloProvider client={ apollo }>
          <Provider store={ store }>
            <Page>
              <Component { ...pageProps } />
            </Page>
          </Provider>
        </ApolloProvider>
      </Container>
    );
  }
}

export default withApollo( withRedux( makeStore )( Commons ) );
