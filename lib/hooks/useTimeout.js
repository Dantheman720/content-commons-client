import { useState, useEffect, useRef } from 'react';

/**
 * Execute a callback after a specfied delay.  Clears timeout on completion
 * @param {functin} cb functin to execute after delay
 * @param {number} delay time to wait before executing callbacl
 * @usage
    const doSomething = () => {}
    const { startTimeout } = useTimeout( doSomething, 2000 );
 */
function useTimeout( cb, delay ) {
  const [isTimeoutActive, setIsTimeoutActive] = useState( false );
  const savedCallback = useRef();

  // Remember the latest cb.
  useEffect( () => {
    savedCallback.current = cb;
  },
  [cb] );


  function clearTimeout() {
    setIsTimeoutActive( false );
  }

  function startTimeout() {
    setIsTimeoutActive( true );
  }

  function callback() {
    if ( savedCallback.current ) {
      savedCallback.current();
    }
    clearTimeout();
  }

  useEffect( () => {
    if ( isTimeoutActive ) {
      const timeout = window.setTimeout( callback, delay );
      return () => {
        window.clearTimeout( timeout );
      };
    }
  }, [isTimeoutActive] );

  return {
    clearTimeout,
    startTimeout,
    stop: clearTimeout
  };
}


export default useTimeout;
