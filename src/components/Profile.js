import React, { useState, useEffect, useContext } from 'react';
import { getUserRecipes, createRecipe, getAllIngredients, deleteRecipe } from '../services/api'; 
import { AuthContext } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';

function Profile() {
  const [recipes, setRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({ nome: '', descricao: '', ingredientes: [] });
  const [ingredients, setIngredients] = useState([]);
  const { userId, nickname } = useContext(AuthContext);
  const history = useHistory();

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!userId) return;
      try {
        const response = await getUserRecipes(userId);
        setRecipes(response);
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          console.error(error);
          alert(error || 'Erro ao buscar receitas');
        }
      }
    };

    const fetchIngredients = async () => {
      try {
        const response = await getAllIngredients(); 
        setIngredients(response);
      } catch (error) {
        console.error(error);
        alert('Erro ao buscar ingredientes.');
      }
    };

    fetchRecipes();
    fetchIngredients();
  }, [userId]);

  const handleRecipeClick = (recipe) => {
    history.push(`recipes/${recipe.id}`, { recipe });
  };

  const handleDeleteRecipe = async (recipeId) => {
    const confirmDelete = window.confirm('Você tem certeza que deseja apagar esta receita?');
    if (!confirmDelete) return;

    try {
      await deleteRecipe(recipeId);
      alert('Receita apagada com sucesso!');
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    } catch (error) {
      console.error(error);
      alert('Erro ao apagar receita.');
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...newRecipe.ingredientes];
    updatedIngredients[index][field] = value;
    setNewRecipe({ ...newRecipe, ingredientes: updatedIngredients });
  };

  const addIngredientField = () => {
    setNewRecipe({ ...newRecipe, ingredientes: [...newRecipe.ingredientes, { nomeDoIngrediente: '', quantidade: 0 }] });
  };

  const createRecipe_ = async () => {
    try {
      const recipeData = {
        ...newRecipe,
        idDoUsuario: userId,
      };
      await createRecipe(recipeData);
      alert('Receita criada!');
      setNewRecipe({ nome: '', descricao: '', ingredientes: [] });
    } catch (error) {
      console.error(error);
      alert(error || 'Erro ao criar receita');
    }
  };

  return (
    <div>
      <h1>Bem-vindo, {nickname}!</h1>

      <h2>Minhas Receitas</h2>
      {recipes.length > 0 ? (
        recipes.map((recipe) => (
          <div key={recipe.id} style={{ marginBottom: '10px' }}>
            <div 
              onClick={() => handleRecipeClick(recipe)} 
              style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
            >
              {recipe.nome}
            </div>
            <button onClick={() => handleDeleteRecipe(recipe.id)} style={{ marginLeft: '10px' }}>
              Apagar
            </button>
          </div>
        ))
      ) : (
        <p>Você não postou nenhuma receita.</p>
      )}

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
      {newRecipe.ingredientes.map((ingredient, index) => (
        <div key={index}>
          <select
            value={ingredient.nomeDoIngrediente}
            onChange={(e) => handleIngredientChange(index, 'nomeDoIngrediente', e.target.value)}
          >
            <option value="">Selecione um ingrediente</option>
            {ingredients.map((ing) => (
              <option key={ing.nome} value={ing.nome}>
                {ing.nome} ({ing.tipoDeMedida})
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Quantidade"
            value={ingredient.quantidade}
            onChange={(e) => handleIngredientChange(index, 'quantidade',  Number(e.target.value))}
          />
        </div>
      ))}
      <button onClick={addIngredientField}>Adicionar Ingrediente</button>
      <button onClick={createRecipe_}>Criar Receita</button>
    </div>
  );
}

export default Profile;
