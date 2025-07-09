import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_TOKEN: 'SET_TOKEN',
  SET_CARS: 'SET_CARS',
  SET_SHOW_LOGIN: 'SET_SHOW_LOGIN',
  SET_DATES: 'SET_DATES',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState = {
  user: null,
  token: null,
  cars: [],
  showLogin: false,
  pickupDate: '',
  returnDate: '',
  loading: {
    auth: false,
    cars: false,
    general: false,
  },
  error: null,
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.value,
        },
      };

    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
      };

    case ActionTypes.SET_TOKEN:
      return {
        ...state,
        token: action.payload,
      };

    case ActionTypes.SET_CARS:
      return {
        ...state,
        cars: action.payload,
      };

    case ActionTypes.SET_SHOW_LOGIN:
      return {
        ...state,
        showLogin: action.payload,
      };

    case ActionTypes.SET_DATES:
      return {
        ...state,
        pickupDate: action.payload.pickupDate,
        returnDate: action.payload.returnDate,
      };

    case ActionTypes.LOGOUT:
      return {
        ...initialState,
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  // Initialize token from localStorage and fetch cars once
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        dispatch({ type: ActionTypes.SET_TOKEN, payload: storedToken });
      }
      
      // Fetch cars once on initial load - call directly to avoid dependency issues
      const initFetchCars = async () => {
        try {
          setLoading('cars', true);
          const response = await axios.get('/api/user/cars');
          const data = response.data;
          
          if (data.success) {
            dispatch({ type: ActionTypes.SET_CARS, payload: data.data.cars });
          }
        } catch (error) {
          console.error('Failed to fetch cars on init:', error);
        } finally {
          setLoading('cars', false);
        }
      };
      
      initFetchCars();
    }
  }, []); // Empty dependency array - only run once on mount

  // Auto-fetch user data when token is available
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `${state.token}`;
      // Only fetch user if we don't have user data yet
      if (!state.user) {
        fetchUser();
      }
    } else {
      // Clear auth header if no token
      axios.defaults.headers.common['Authorization'] = '';
    }
  }, [state.token, state.user]); // Remove fetchUser from dependencies to avoid loops

  // Helper function to set loading state
  const setLoading = useCallback((type, value) => {
    dispatch({ 
      type: ActionTypes.SET_LOADING, 
      payload: { type, value } 
    });
  }, []);

  // Authentication functions
  const fetchUser = useCallback(async (shouldRedirect = false) => {
    try {
      setLoading('auth', true);
      const response = await axios.get('/api/user/data');
      const data = response.data;
      
      if (data.success) {
        const user = data.data.user;
        dispatch({ type: ActionTypes.SET_USER, payload: user });
        
        // Redirect to appropriate dashboard if requested
        if (shouldRedirect && user.role === 'owner') {
          navigate('/owner');
        }
      } else {
        // Don't show error toast for failed authentication on page load
        if (shouldRedirect) {
          toast.error(data.message);
        }
        logout();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Only show error toast if it's not an authentication error on page load
      if (error.response?.status !== 401 && shouldRedirect) {
        toast.error(error.message);
      }
      // Clear invalid token
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading('auth', false);
    }
  }, [navigate]);

  const login = async (credentials) => {
    try {
      setLoading('auth', true);
      const response = await axios.post('/api/user/login', credentials);
      const data = response.data;
      
      if (data.success) {
        const { token, user } = data.data;
        
        dispatch({ type: ActionTypes.SET_TOKEN, payload: token });
        dispatch({ type: ActionTypes.SET_USER, payload: user });
        localStorage.setItem('token', token);
        
        toast.success('Login successful!');
        dispatch({ type: ActionTypes.SET_SHOW_LOGIN, payload: false });
        
        return { user, success: true };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Login failed');
      throw error;
    } finally {
      setLoading('auth', false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading('auth', true);
      const response = await axios.post('/api/user/register', userData);
      const data = response.data;
      
      if (data.success) {
        const { token, user } = data.data;
        
        dispatch({ type: ActionTypes.SET_TOKEN, payload: token });
        dispatch({ type: ActionTypes.SET_USER, payload: user });
        localStorage.setItem('token', token);
        
        toast.success('Registration successful!');
        dispatch({ type: ActionTypes.SET_SHOW_LOGIN, payload: false });
        
        return { user, success: true };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading('auth', false);
    }
  };

  const logout = useCallback(() => {
    dispatch({ type: ActionTypes.LOGOUT });
    localStorage.removeItem('token');
    axios.defaults.headers.common['Authorization'] = '';
    navigate('/');
    toast.success('Logged out successfully');
  }, [navigate]);

  // Car functions
  const fetchCars = useCallback(async (filters = {}) => {
    try {
      setLoading('cars', true);
      const response = await axios.get('/api/user/cars', { params: filters });
      const data = response.data;
      
      if (data.success) {
        dispatch({ type: ActionTypes.SET_CARS, payload: data.data.cars });
      } else {
        toast.error(data.message);
      }
      
      return data;
    } catch (error) {
      toast.error('Failed to fetch cars');
      console.error('Failed to fetch cars:', error);
    } finally {
      setLoading('cars', false);
    }
  }, [setLoading]);

  // Utility functions
  const changeRole = async () => {
    try {
      setLoading('general', true);
      const response = await axios.post('/api/owner/change-role');
      const data = response.data;
      
      if (data.success) {
        // Update user role in state
        dispatch({ 
          type: ActionTypes.SET_USER, 
          payload: { ...state.user, role: 'owner' } 
        });
        toast.success(data.message);
        navigate('/owner');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to change role');
    } finally {
      setLoading('general', false);
    }
  };

  const setDates = (pickupDate, returnDate) => {
    dispatch({ 
      type: ActionTypes.SET_DATES, 
      payload: { pickupDate, returnDate } 
    });
  };

  const showLoginModal = () => {
    dispatch({ type: ActionTypes.SET_SHOW_LOGIN, payload: true });
  };

  const hideLoginModal = () => {
    dispatch({ type: ActionTypes.SET_SHOW_LOGIN, payload: false });
  };

  // Legacy functions for backward compatibility
  const setUserData = (userData) => {
    if (!userData) {
      console.error('setUserData called with undefined userData');
      return;
    }
    dispatch({ type: ActionTypes.SET_USER, payload: userData });
  };

  const setToken = (token) => {
    dispatch({ type: ActionTypes.SET_TOKEN, payload: token });
  };

  const setUser = (user) => {
    dispatch({ type: ActionTypes.SET_USER, payload: user });
  };

  const setShowLogin = (show) => {
    dispatch({ type: ActionTypes.SET_SHOW_LOGIN, payload: show });
  };

  const setCars = (cars) => {
    dispatch({ type: ActionTypes.SET_CARS, payload: cars });
  };

  const setPickupDate = (date) => {
    dispatch({ 
      type: ActionTypes.SET_DATES, 
      payload: { pickupDate: date, returnDate: state.returnDate } 
    });
  };

  const setReturnDate = (date) => {
    dispatch({ 
      type: ActionTypes.SET_DATES, 
      payload: { pickupDate: state.pickupDate, returnDate: date } 
    });
  };

  // Computed values
  const isAuthenticated = Boolean(state.token && state.user);
  const isOwner = state.user?.role === 'owner';
  const currency = import.meta.env.VITE_CURRENCY || 'GBP';

  const value = {
    // State
    ...state,
    isAuthenticated,
    isOwner,
    currency,
    
    // Legacy state accessors for backward compatibility
    user: state.user,
    token: state.token,
    cars: state.cars,
    showLogin: state.showLogin,
    pickupDate: state.pickupDate,
    returnDate: state.returnDate,

    // Enhanced actions
    login,
    register,
    logout,
    fetchUser,
    fetchCars,
    changeRole,
    setDates,
    showLoginModal,
    hideLoginModal,
    setLoading,
    
    // Legacy actions for backward compatibility
    setUserData,
    setToken,
    setUser,
    setShowLogin,
    setCars,
    setPickupDate,
    setReturnDate,
    
    // Utilities
    navigate,
    axios,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};