import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {getRecipesByIngredients} from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

function IngredientSearch() {
  const [ingredients, setIngredients] = useState([{ name: '', quantity: 0 }]);
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext); 

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 0 }]);
  };

  const handleChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const searchRecipes = async () => {
    try {
      let ingredientList = ingredients.map((ingredient) => ingredient.name);
      const response = await getRecipesByIngredients(ingredientList.join(", "));
      const adaptedRecipes = adaptRecipes(response.data, ingredients);
      setRecipes(adaptedRecipes);
    } catch (error) {
      console.error(error);
      alert('Erro ao buscar receitas');
    }
  };

  const adaptRecipes = (recipes, availableIngredients) => {
    return recipes.map(recipe => {
      const adaptedIngredients = recipe.ingredients.map(ingredient => {
        const available = availableIngredients.find(i => i.name === ingredient.nomeDoIngrediente);
        return {
          ...ingredient,
          quantidade: available ? Math.floor(available.quantity / ingredient.quantidade) : 0
        };
      });

      // Calcular o fator mínimo
      const minFactor = Math.min(...adaptedIngredients.map(i => i.quantidade).filter(q => q > 0));

      // Ajustar as quantidades com o fator mínimo
      const adjustedIngredients = adaptedIngredients.map(ingredient => ({
        ...ingredient,
        quantidade: ingredient.quantidade * minFactor,
      }));

      return { ...recipe, ingredientes: adjustedIngredients, minFactor }; // Passar o fator mínimo
    });
  };

  const goToLogin = () => {
    navigate('/login'); // Redireciona para a página de login
  };

  const goToSignup = () => {
    navigate('/signup'); // Redireciona para a página de cadastro
  };

  const goToProfile = () => {
    navigate('/profile'); // Redireciona para a página do perfil
  };

  const viewRecipeDetails = (id, minFactor) => {
    navigate(`/recipes/${id}`, { state: { minFactor } }); // Passa o fator mínimo ao redirecionar
  };

  return (
    <div>
      {/* Botões de Login, Cadastro ou Perfil */}
      {!isAuthenticated ? (
        <div>
          <button onClick={goToLogin}>Login</button>
          <button onClick={goToSignup}>Cadastro</button>
        </div>
      ) : (
        <button onClick={goToProfile}>Perfil</button> // Botão de perfil para usuário autenticado
      )}

      {/* Lista de Ingredientes */}
      {ingredients.map((ingredient, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Ingrediente"
            value={ingredient.name}
            onChange={(e) => handleChange(index, 'name', e.target.value)}
          />
          <input
            type="number"
            placeholder="Quantidade"
            value={ingredient.quantity}
            onChange={(e) => handleChange(index, 'quantity', e.target.value)}
          />
        </div>
      ))}
      <button onClick={addIngredient}>Adicionar Ingrediente</button>
      <button onClick={searchRecipes}>Buscar Receitas</button>

      {/* Lista de Receitas Encontradas */}
      <div>
        {recipes.map((recipe, index) => (
          <div
            key={index}
            onClick={() => viewRecipeDetails(recipe.id, recipe.minFactor)} // Passa o fator mínimo para RecipeDetails
            style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
          >
            {recipe.nome} {/* Usar o nome correto da receita */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default IngredientSearch;
