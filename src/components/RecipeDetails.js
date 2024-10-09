import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { addReview, getRecipeReviews } from '../services/api'; 

function RecipeDetails() {
  const { state } = useLocation();
  const { recipe } = state;        
  const [review, setReview] = useState({ rating: '', comment: '' });
  const [reviews, setReviews] = useState([]); 
  const { userId } = useContext(AuthContext);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getRecipeReviews(recipe.id);
        setReviews(response);
      } catch (error) {
        console.error(error);
      }
    };

    fetchReviews();
  }, [recipe.id]);

  const adjustedIngredients = recipe.ingredientes.map(ingredient => ({
    ...ingredient,
    quantidade: ingredient.quantidade,
  }));

  const submitReview = async () => {
    try {
      await addReview({ comentario: review.comment, nota: review.rating, idDoUsuario: Number(userId), idDaReceita: Number(recipe.id) });
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
          <h3>Ingredientes</h3>
          <ul>
            {adjustedIngredients.map(ingredient => (
              <li key={ingredient.idDaReceita}>
                {ingredient.nomeDoIngrediente}: {ingredient.quantidade}
              </li>
            ))}
          </ul>
          <h3>Avaliações</h3>
          {reviews.length > 0 ? ( // Verifica se há avaliações
            reviews.map((r) => (
              <div key={r.idDoUsuario}>{r.comentario} - Nota: {r.nota}</div>
            ))
          ) : (
            <p>Sem avaliações ainda.</p> // Exibe mensagem se não houver avaliações
          )}
          <h4>Avaliar Receita</h4>
          <input
            type="number"
            value={review.rating}
            onChange={(e) => setReview({ ...review, rating: Number(e.target.value)})}
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
