import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { addReview, getRecipeReviews, getAllIngredients } from '../services/api'; 

function RecipeDetails() {
  const { state } = useLocation();
  const { recipe } = state;        
  const [review, setReview] = useState({ rating: '', comment: '' });
  const [reviews, setReviews] = useState([]); 
  const { userId } = useContext(AuthContext);
  const [ingredientsWithMeasurements, setIngredientsWithMeasurements] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getRecipeReviews(recipe.id);
        setReviews(response);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchIngredients = async () => {
      try {
        const response = await getAllIngredients();
        const mappedIngredients = recipe.ingredientesReceita.map(ingredient => {
          const foundIngredient = response.find(ing => ing.nome === ingredient.nomeDoIngrediente);
          return {
            ...ingredient,
            tipoDeMedida: foundIngredient.tipoDeMedida,
            quantidadeAjustada: ingredient.quantidade * (recipe.minFactor || 1),
          };
        });
        setIngredientsWithMeasurements(mappedIngredients);
      } catch (error) {
        console.error('Erro ao buscar os ingredientes com tipo de medida:', error);
      }
    };

    fetchReviews();
    fetchIngredients();
  }, [recipe.id, recipe.ingredientesReceita, recipe.minFactor]);

  const submitReview = async () => {
    try {
      await addReview({
        comentario: review.comment,
        nota: review.rating,
        idDoUsuario: Number(userId),
        idDaReceita: Number(recipe.id)
      });
      alert('Avaliação enviada!');
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return (
    <div>
      {recipe && (
        <>
          <h2>{recipe.nome}</h2>
          <p>{recipe.descricao}</p>

          {(recipe.minFactor && recipe.minFactor !== 1) && (
            <p>
              Esta receita rende {Math.round(recipe.minFactor * 100)}% das porções da receita original.
            </p>
          )}

          <h3>Ingredientes</h3>
          <ul>
            {ingredientsWithMeasurements.map(ingredient => (
              <li key={ingredient.idDaReceita}>
                {ingredient.nomeDoIngrediente}: {ingredient.quantidadeAjustada} {ingredient.tipoDeMedida}
                {recipe.minFactor !== 1 && (
                  <span> (Original: {ingredient.quantidade} {ingredient.tipoDeMedida})</span>
                )}
              </li>
            ))}
          </ul>

          <h3>Avaliações</h3>
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r.idDoUsuario}>
                {r.comentario} - Nota: {r.nota}
              </div>
            ))
          ) : (
            <p>Sem avaliações ainda.</p>
          )}

          <h4>Avaliar Receita</h4>
          <input
            type="number"
            value={review.rating}
            onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}
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
