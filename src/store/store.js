import {configureStore} from '@reduxjs/toolkit';
import datasetReducer from './datasetSlice';

const store = configureStore({
  reducer: {
    dataset: datasetReducer,
  },
});

export default store;