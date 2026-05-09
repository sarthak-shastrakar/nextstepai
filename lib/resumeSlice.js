import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTemplate: 'smartpro',
  previewModalOpen: false,
  selectedTemplatePreview: null,
  isGenerating: false,
};

export const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setActiveTemplate: (state, action) => {
      state.activeTemplate = action.payload;
    },
    setPreviewModalOpen: (state, action) => {
      state.previewModalOpen = action.payload;
    },
    setSelectedTemplatePreview: (state, action) => {
      state.selectedTemplatePreview = action.payload;
    },
    setIsGenerating: (state, action) => {
      state.isGenerating = action.payload;
    },
  },
});

export const { setActiveTemplate, setPreviewModalOpen, setSelectedTemplatePreview, setIsGenerating } = resumeSlice.actions;

export default resumeSlice.reducer;
