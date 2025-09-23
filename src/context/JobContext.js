import React, { createContext, useContext, useReducer } from 'react';
import { api } from '../services/api';

const JobContext = createContext();

const initialState = {
  jobs: [],
  currentJob: null,
  applications: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    location: '',
    jobType: '',
    workMode: '',
    minSalary: '',
    maxSalary: '',
    experience: '',
    skills: '',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

const jobReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_JOBS':
      return {
        ...state,
        jobs: action.payload.jobs,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case 'ADD_JOBS':
      return {
        ...state,
        jobs: [...state.jobs, ...action.payload.jobs],
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case 'SET_CURRENT_JOB':
      return {
        ...state,
        currentJob: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_APPLICATIONS':
      return {
        ...state,
        applications: action.payload.applications,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
      };
    case 'RESET_JOBS':
      return {
        ...state,
        jobs: [],
        pagination: initialState.pagination,
      };
    default:
      return state;
  }
};

export const JobProvider = ({ children }) => {
  const [state, dispatch] = useReducer(jobReducer, initialState);

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const fetchJobs = async (params = {}) => {
    try {
      setLoading(true);
      clearError();

      const queryParams = {
        ...state.filters,
        ...params,
        page: params.page || 1,
        limit: 10,
      };

      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await api.get('/jobs', { params: queryParams });
      const { jobs, pagination } = response.data;

      if (params.page && params.page > 1) {
        dispatch({ type: 'ADD_JOBS', payload: { jobs, pagination } });
      } else {
        dispatch({ type: 'SET_JOBS', payload: { jobs, pagination } });
      }

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch jobs';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const fetchJobById = async (jobId) => {
    try {
      setLoading(true);
      clearError();

      const response = await api.get(`/jobs/${jobId}`);
      const { job } = response.data;

      dispatch({ type: 'SET_CURRENT_JOB', payload: job });
      return { success: true, data: job };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch job details';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const searchJobs = async (searchParams) => {
    try {
      setLoading(true);
      clearError();

      const queryParams = {
        ...state.filters,
        ...searchParams,
        page: 1,
        limit: 10,
      };

      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await api.get('/jobs', { params: queryParams });
      const { jobs, pagination } = response.data;

      dispatch({ type: 'SET_JOBS', payload: { jobs, pagination } });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Search failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const getSearchSuggestions = async (query) => {
    try {
      if (!query || query.length < 2) {
        return { success: true, data: { suggestions: [] } };
      }

      const response = await api.get('/jobs/search/suggestions', {
        params: { q: query }
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get suggestions error:', error);
      return { success: false, error: 'Failed to get suggestions' };
    }
  };

  const applyForJob = async (jobId, applicationData) => {
    try {
      setLoading(true);
      clearError();

      const response = await api.post('/applications', {
        jobId,
        ...applicationData
      });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to apply for job';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const fetchMyApplications = async (params = {}) => {
    try {
      setLoading(true);
      clearError();

      const queryParams = {
        page: params.page || 1,
        limit: 10,
        ...params
      };

      const response = await api.get('/applications/my-applications', {
        params: queryParams
      });

      const { applications, pagination } = response.data;
      dispatch({ type: 'SET_APPLICATIONS', payload: { applications, pagination } });

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch applications';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const postJob = async (jobData) => {
    try {
      setLoading(true);
      clearError();

      const response = await api.post('/jobs', jobData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to post job';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateFilters = (filters) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  const resetJobs = () => {
    dispatch({ type: 'RESET_JOBS' });
  };

  const value = {
    ...state,
    fetchJobs,
    fetchJobById,
    searchJobs,
    getSearchSuggestions,
    applyForJob,
    fetchMyApplications,
    postJob,
    updateFilters,
    clearFilters,
    resetJobs,
    setLoading,
    setError,
    clearError,
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
