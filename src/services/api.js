const BASE_URL = 'http://localhost:5000';

const apiRequest = async (endpoint, method = 'GET', body = null, requiresAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      throw new Error('Usuário não autenticado.');
    }
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição à API');
  }

  return data;
};

// Endpoints de usuário
export const loginUser = (email, password) => {
  return apiRequest('/usuarios/login', 'POST', { email: email, senha: password });
};

export const registerUser = (userData) => {
  return apiRequest('/usuarios', 'POST', userData);
};

export const getUserByEmail = (userEmail) => {
  return apiRequest(`/usuarios/email/${userEmail}`, 'GET'); 
};

// Endpoints de receitas
export const getRecipesByIngredients = (ingredients) => {
  return apiRequest(`/receitas/ingredientes?ingredientes=${encodeURIComponent(ingredients)}`, 'GET');
};

export const createRecipe = (recipeData) => {
  return apiRequest('/receitas', 'POST', recipeData, true);
};

export const updateRecipe = (recipeId, updatedData) => {
  return apiRequest(`/receitas/${recipeId}`, 'PUT', updatedData, true); 
};

export const deleteRecipe = (recipeId) => {
  return apiRequest(`/receitas/${recipeId}`, 'DELETE', null, true);
};

export const getUserRecipes = (userId) => {
  return apiRequest(`/receitas/usuario/${userId}`, 'GET');
};

// Endpoints de ingredientes
export const getAllIngredients = () => {
  return apiRequest('/ingredientes', 'GET');
};

// Endpoints de avaliações
export const addReview = (reviewData) => {
  return apiRequest('/avaliacoes', 'POST', reviewData, true);
};

export const getRecipeReviews = (recipeId) => {
  return apiRequest(`/avaliacoes/receita/${recipeId}`, 'GET');
};

export const updateReview = (recipeId, userId, reviewData) => {
  return apiRequest(`/avaliacoes/${userId}/${recipeId}`, 'PUT', reviewData, true);
};

export const deleteReview = (recipeId, userId) => {
  return apiRequest(`/avaliacoes/${userId}/${recipeId}`, 'DELETE', null, true);
};