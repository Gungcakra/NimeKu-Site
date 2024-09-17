import { createStore } from 'redux';

// Definisikan action types
const SET_ANIME_ID = 'SET_ANIME_ID';

// Definisikan action creators
export const setAnimeId = (id) => ({
  type: SET_ANIME_ID,
  payload: id,
});

// Definisikan reducer
const initialState = {
  animeId: null,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_ANIME_ID:
      return {
        ...state,
        animeId: action.payload,
      };
    default:
      return state;
  }
};

// Buat store
const store = createStore(reducer);

export default store;
