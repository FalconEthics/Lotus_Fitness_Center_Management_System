import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  members: [],
  classes: [],
};

const datasetSlice = createSlice({
  name: 'dataset',
  initialState,
  reducers: {
    // This sets the dataset in the Redux store when the user uploads a dataset file.
    setDataset: (state, action) => {
      state.members = action.payload.members;
      state.classes = action.payload.classes;
    },

    // Member CRUD operations
    addMember: (state, action) => {
      state.members.push(action.payload);
    },
    updateMember: (state, action) => {
      const index = state.members.findIndex(member => member.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = action.payload;
      }
    },
    deleteMember: (state, action) => {
      const memberId = action.payload;
      state.members = state.members.filter(member => member.id !== memberId);
      // Remove the member from all classes
      state.classes = state.classes.map(cls => ({
        ...cls,
        enrolled: cls.enrolled.filter(id => id !== memberId)
      }));
    },

    // Class CRUD operations
    addClass: (state, action) => {
      state.classes.push(action.payload);
    },
    updateClass: (state, action) => {
      const index = state.classes.findIndex(cls => cls.id === action.payload.id);
      if (index !== -1) {
        state.classes[index] = action.payload;
      }
    },
    deleteClass: (state, action) => {
      state.classes = state.classes.filter(cls => cls.id !== action.payload);
    },
  },
});

export const {
  setDataset,
  addMember,
  updateMember,
  deleteMember,
  addClass,
  updateClass,
  deleteClass,
} = datasetSlice.actions;

export default datasetSlice.reducer;