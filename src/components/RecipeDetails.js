import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getRecipeDetails, addReview } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

function RecipeDetails() {
  const { id } = useParams();
  const { state } = useLocation(); 
  const [recipe, setRecipe] = useState(null);
  const [review, setReview] = useState({ rating: '', comment: '' });
  const { userId } = useContext(AuthContext);
  const minFactor = state?.minFactor || 1; 

  useEffect(() => {
    const fetchRecipe = async () => {
      const response = await getRecipeDetails(id);
      setRecipe(response.data);
    };
    fetchRecipe();
  }, [id]);

  const submitReview = async () => {
    try {
      await addReview({ comentario: review.comment, nota: review.rating, idDoUsuario: userId, idDaReceita: id });
      alert('Avaliação enviada!');
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar avaliação');
    }
  };

  const adjustedIngredients = recipe?.ingredientes.map(ingredient => ({
    ...ingredient,
    quantidade: ingredient.quantidade * minFactor,
  }));

  return (
    <div>
      {recipe && (
        <>
          <h2>{recipe.nome}</h2>
          <p>{recipe.descricao}</p>
          <h3>Ingredientes</h3>
          <ul>
            {adjustedIngredients.map(ingredient => (
              <li key={ingredient.idDaReceita}>
                {ingredient.nomeDoIngrediente}: {ingredient.quantidade}
              </li>
            ))}
          </ul>
          <h3>Avaliações</h3>
          {recipe.avaliacoes.map((r) => (
            <div key={r.idDoUsuario}>{r.comentario} - Nota: {r.nota}</div>
          ))}
          <h4>Avaliar Receita</h4>
          <input
            type="number"
            value={review.rating}
            onChange={(e) => setReview({ ...review, rating: e.target.value })}
            placeholder="Nota (1-5)"
          />
          <input
            type="text"
            value={review.comment}
            onChange={(e) => setReview({ ...review, comment: e.target.value })}
            placeholder="Comentário"
          />
          <button onClick={submitReview}>Enviar Avaliação</button>
        </>
      )}
    </div>
  );
}

export default RecipeDetails;
