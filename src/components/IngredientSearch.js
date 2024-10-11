import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getRecipesByIngredients, getAllIngredients } from '../services/api'; 
import { AuthContext } from '../contexts/AuthContext';

function IngredientSearch() {
  const [ingredients, setIngredients] = useState([{ name: '', quantity: 0 }]);
  const [availableIngredients, setAvailableIngredients] = useState([]); 
  const [recipes, setRecipes] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const history = useHistory();
  const { token, logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await getAllIngredients(); 
        setAvailableIngredients(response);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message || 'Erro ao buscar ingredientes.');
      }
    };

    fetchIngredients();
  }, []);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 0 }]);
  };

  const handleChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const searchRecipes = async () => {
    setErrorMessage('');
    const emptyIngredient = ingredients.some(ingredient => !ingredient.name.trim() || ingredient.quantity <= 0);
    if (emptyIngredient) {
      setErrorMessage('Por favor, preencha todos os ingredientes corretamente.');
      return;
    }

    try {
      const ingredientList = (ingredients.map((ingredient) => ingredient.name)).join(", ");
      const response = await getRecipesByIngredients(ingredientList);
      
      if (response.status === 404) {
        setErrorMessage('Nenhuma receita encontrada.');
      } else {
        const adaptedRecipes = adaptRecipes(response, ingredients);
        setRecipes(adaptedRecipes);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || 'Erro ao buscar receitas. Tente novamente.');
    }
  };

  const adaptRecipes = (recipes, availableIngredients) => {
    return recipes.map(recipe => {
      const ingredientProportions = recipe.ingredientesReceita.map(ingredient => {
        const available = availableIngredients.find(i => i.name === ingredient.nomeDoIngrediente);
        return {
          ...ingredient,
          quantidade: available ? available.quantity / ingredient.quantidade : 0
        };
      });

      const minFactor = Math.min(...ingredientProportions.map(i => i.quantidade).filter(q => q > 0));

      return { ...recipe, minFactor: minFactor};
    });
  };

  const goToLogin = () => {
    history.push('/login');
  };

  const goToSignup = () => {
    history.push('/signup');
  };

  const goToProfile = () => {
    history.push('/profile');
  };

  const doLogout = () => {
    logout();
    history.push('/dashboard');
  };

  const viewRecipeDetails = (recipe) => {
    history.push(`/recipes/${recipe.id}`, { recipe });
  };  

  return (
    <div>
      {!token ? (
        <div>
          <button onClick={goToLogin}>Login</button>
          <button onClick={goToSignup}>Cadastro</button>
        </div>
      ) : (
        <div>
          <button onClick={goToProfile}>Perfil</button>
          <button onClick={doLogout}>Logout</button>
        </div>
      )}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {ingredients.map((ingredient, index) => (
        <div key={index}>
          <select
            value={ingredient.name}
            onChange={(e) => handleChange(index, 'name', e.target.value)}
          >
            <option value="">Selecione um ingrediente</option>
            {availableIngredients.map((ing) => (
              <option key={ing.nome} value={ing.nome}>
                {ing.nome} ({ing.tipoDeMedida})
              </option>
            ))}
          </select>
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

      <div>
        {recipes.map((recipe, index) => (
        <div
          key={index}
          onClick={() => viewRecipeDetails(recipe)} 
          style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
        >
        {recipe.nome}
      </div>
))}
      </div>
    </div>
  );
}

export default IngredientSearch;
