import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import {
  categoryEndpoint,
  getAllProdsByCategoryEnpoint,
} from '../constants/endpoints';
import { status } from '../constants/helpers';

const initialState_category = {
  allCategories: {
    list: [],
    status: 'idle',
    error: null,
    lastAdded: {},
    lastDeleted: {},
  },
  allProdsByCategory: {
    taste: '',
    list: [],
    status: 'idle',
    error: null,
  },
};

export const getAllCategories = createAsyncThunk(
  'category/getAllCategories',
  async () => {
    const resp = await axios.get(categoryEndpoint);
    return resp;
  }
);

export const getAllProdsByCategory = createAsyncThunk(
  'category/getAllProdsByCategory',
  async (taste) => {
    const resp = await axios.get(getAllProdsByCategoryEnpoint + taste);
    return resp;
  }
);

export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async ({ categoryId, formik }) => {
    const resp = await axios.delete(categoryEndpoint + categoryId);
    const payload = { resp, formik };
    return payload;
  }
);

export const postNewCategory = createAsyncThunk(
  'category/postNewCategory',
  async ({ categoryName, formik }) => {
    const resp = await axios.post(categoryEndpoint, categoryName);
    const payload = { resp, formik };
    return payload;
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState: initialState_category,
  reducers: {},
  extraReducers: {
    [getAllCategories.pending]: (state, action) => {
      state.allCategories.status = status.loading;
    },
    [getAllCategories.fulfilled]: (state, { payload }) => {
      state.allCategories.status = status.succeded;
      state.allCategories.list = payload.data;
    },
    [getAllCategories.rejected]: (state, action) => {
      state.allCategories.status = status.failed;
      state.allCategories.error = action.error;
    },
    [getAllProdsByCategory.pending]: (state, action) => {
      state.allProdsByCategory.status = status.loading;
    },
    [getAllProdsByCategory.fulfilled]: (state, { payload }) => {
      state.allProdsByCategory.status = status.succeded;
      state.allProdsByCategory.list = payload.data[0].products;
      state.allProdsByCategory.taste = payload.data[0].taste;
    },
    [getAllProdsByCategory.rejected]: (state, action) => {
      state.allProdsByCategory.status = status.failed;
      state.allProdsByCategory.error = action.error;
    },
    [postNewCategory.pending]: (state, action) => {
      state.allCategories.status = status.loading;
    },
    [postNewCategory.fulfilled]: (state, action) => {
      const { formik, resp } = action.payload;
      state.allCategories.status = status.succeded;
      state.allCategories.list.push(resp.data[0]);
      state.allCategories.lastAdded = resp.data[0];
      formik.resetForm();
    },
    [postNewCategory.rejected]: (state, action) => {
      state.allCategories.status = status.failed;
      state.error = action.error;
    },
    [deleteCategory.pending]: (state, action) => {
      state.allCategories.status = status.loading;
    },
    [deleteCategory.fulfilled]: (state, action) => {
      const { categoryId } = action.meta.arg;
      const { formik } = action.payload;
      state.allCategories.status = status.succeded;
      state.allCategories.lastDeleted = state.allCategories.list.find(
        (category) => category.id === categoryId
      );
      const filtered_category_list = state.allCategories.list.filter(
        (category) => category.id !== categoryId
      );
      state.allCategories.list = filtered_category_list;
      formik.resetForm();
    },
    [deleteCategory.rejected]: (state, action) => {
      state.allCategories.status = status.failed;
      state.error = action.error;
    },
  },
});

export default categorySlice;
