import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService } from '../services/api.js';
import { useLocalStorage } from '../hooks/index.js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [storedToken, setStoredToken] = useLocalStorage('token', null);
  const navigate = useNavigate();

  // Initialize token from localStorage
  useEffect(() => {
    if (storedToken && !state.token) {
      dispatch({ type: ActionTypes.SET_TOKEN, payload: storedToken });
    }
  }, [storedToken, state.token]);

  // Auto-fetch user data when token is available
  useEffect(() => {
    if (state.token && !state.user) {
      fetchUser();
    }
  }, [state.token]);

  // Helper function to set loading state
  const setLoading = (type, value) => {
    dispatch({ 
      type: ActionTypes.SET_LOADING, 
      payload: { type, value } 
    });
  };

  // Authentication functions
  const fetchUser = async () => {
    try {
      setLoading('auth', true);
      const response = await apiService.get('/api/user/data');
      
      if (response.success) {
        dispatch({ type: ActionTypes.SET_USER, payload: response.user });
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading('auth', false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading('auth', true);
      const response = await apiService.post('/api/user/login', credentials);
      
      if (response.success) {
        const { token, user } = response.data;
        
        dispatch({ type: ActionTypes.SET_TOKEN, payload: token });
        dispatch({ type: ActionTypes.SET_USER, payload: user });
        setStoredToken(token);
        
        toast.success('Login successful!');
        dispatch({ type: ActionTypes.SET_SHOW_LOGIN, payload: false });
        
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading('auth', false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading('auth', true);
      const response = await apiService.post('/api/user/register', userData);
      
      if (response.success) {
        const { token, user } = response.data;
        
        dispatch({ type: ActionTypes.SET_TOKEN, payload: token });
        dispatch({ type: ActionTypes.SET_USER, payload: user });
        setStoredToken(token);
        
        toast.success('Registration successful!');
        dispatch({ type: ActionTypes.SET_SHOW_LOGIN, payload: false });
        
        return response;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading('auth', false);
    }
  };

  const logout = () => {
    dispatch({ type: ActionTypes.LOGOUT });
    setStoredToken(null);
    localStorage.removeItem('token');
    navigate('/');
    toast.success('Logged out successfully');
  };

  // Car functions
  const fetchCars = async (filters = {}) => {
    try {
      setLoading('cars', true);
      const response = await apiService.get('/api/user/cars', { params: filters });
      
      if (response.success) {
        dispatch({ type: ActionTypes.SET_CARS, payload: response.cars });
      } else {
        toast.error(response.message);
      }
      
      return response;
    } catch (error) {
      toast.error('Failed to fetch cars');
      console.error('Failed to fetch cars:', error);
    } finally {
      setLoading('cars', false);
    }
  };

  // Utility functions
  const changeRole = async () => {
    try {
      setLoading('general', true);
      const response = await apiService.post('/api/owner/change-role');
      
      if (response.success) {
        // Update user role in state
        dispatch({ 
          type: ActionTypes.SET_USER, 
          payload: { ...state.user, role: 'owner' } 
        });
        toast.success(response.message);
        navigate('/owner');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to change role');
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

  // Computed values
  const isAuthenticated = Boolean(state.token && state.user);
  const isOwner = state.user?.role === 'owner';
  const currency = 'USD'; // You can make this configurable

  const value = {
    // State
    ...state,
    isAuthenticated,
    isOwner,
    currency,

    // Actions
    login,
    register,
    logout,
    fetchUser,
    fetchCars,
    changeRole,
    setDates,
    showLoginModal,
    hideLoginModal,
    
    // Loading helpers
    setLoading,
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

export default AppContext;
