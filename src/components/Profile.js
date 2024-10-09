import React, { useState, useEffect, useContext } from 'react';
import {getUserRecipes, createRecipe} from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

function Profile() {
  const [recipes, setRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({ nome: '', descricao: '', ingredientesReceita: [{ nomeDoIngrediente: '', quantidade: 0 }] });
  const { userId } = useContext(AuthContext);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!userId) return;
      try {
        const response = await getUserRecipes(userId);
        setRecipes(response.data); 
      } catch (error) {
        console.error(error);
        alert('Erro ao buscar receitas');
      }
    };
    fetchRecipes();
  }, [userId]);

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...newRecipe.ingredientesReceita];
    updatedIngredients[index][field] = value;
    setNewRecipe({ ...newRecipe, ingredientesReceita: updatedIngredients });
  };

  const addIngredientField = () => {
    setNewRecipe({ ...newRecipe, ingredientesReceita: [...newRecipe.ingredientesReceita, { nomeDoIngrediente: '', quantidade: 0 }] });
  };

  const createRecipe_ = async () => {
    try {
      const recipeData = {
        ...newRecipe,
        idDoUsuario: userId,
      };
      await createRecipe(recipeData);
      alert('Receita criada!');
      setNewRecipe({ nome: '', descricao: '', ingredientesReceita: [{ nomeDoIngrediente: '', quantidade: 0 }] });
    } catch (error) {
      console.error(error);
      alert('Erro ao criar receita');
    }
  };

  return (
    <div>
      <h2>Minhas Receitas</h2>
      {recipes.map((recipe) => (
        <div key={recipe.id}>{recipe.nome}</div>
      ))}

      <h3>Criar nova receita</h3>
      <input
        type="text"
        value={newRecipe.nome}
        onChange={(e) => setNewRecipe({ ...newRecipe, nome: e.target.value })}
        placeholder="Nome da Receita"
      />
      <input
        type="text"
        value={newRecipe.descricao}
        onChange={(e) => setNewRecipe({ ...newRecipe, descricao: e.target.value })}
        placeholder="Descrição da Receita"
      />

      <h4>Ingredientes</h4>
      {newRecipe.ingredientesReceita.map((ingredient, index) => (
        <div key={index}>
          <input
            type="text"
            value={ingredient.nomeDoIngrediente}
            onChange={(e) => handleIngredientChange(index, 'nomeDoIngrediente', e.target.value)}
            placeholder={`Ingrediente ${index + 1}`}
          />
          <input
            type="number"
            value={ingredient.quantidade}
            onChange={(e) => handleIngredientChange(index, 'quantidade', e.target.value)}
            placeholder="Quantidade"
          />
        </div>
      ))}
      <button onClick={addIngredientField}>Adicionar Ingrediente</button>
      <button onClick={createRecipe_}>Criar Receita</button>
    </div>
  );
}

export default Profile;
