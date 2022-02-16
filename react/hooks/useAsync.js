// Hook used for making a safe dispatch if the page is changed or unmounted. Used in useAsync
function useSafeDispatch(dispatch) {
  const mountedRef = React.useRef(false)

  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  return React.useCallback(
    (...args) => (mountedRef.current ? dispatch(...args) : void 0),
    [dispatch],
  )
}

// 🐨 this is going to be our generic asyncReducer
function asyncReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

// Hook used for making async requests
function useAsync(initialState) {
  const [state, unsafeDispatch] = React.useReducer(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
    ...initialState
  })

  const dispatch = useSafeDispatch(unsafeDispatch)

  const {data, error, status} = state

  const run = React.useCallback((promise) => {
    dispatch({type: 'pending'})
    promise.then(
      data => {
        dispatch({type: 'resolved', data})
      },
      error => {
        dispatch({type: 'rejected', error})
      },
    )
  }, [dispatch])

  return {
    data,
    error,
    status,
    run
  }
}


// --------------------- How to use inside a component ---------------------//
const {data: pokemon, status, error, run} = useAsync(initialState)

React.useEffect(() => {
  if (!inputParameter) {
    return
  }
  const promise = fetchPromise(inputParameter) // this returns a promise
  run(promise) // here the promise is passed
}, [inputParameter, run])