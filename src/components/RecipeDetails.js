import React, { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { addReview, getRecipeReviews, getAllIngredients, updateRecipe, deleteReview, updateReview } from '../services/api'; 

function RecipeDetails() {
  const { state } = useLocation();
  const { recipe } = state;
  const [review, setReview] = useState({ rating: '', comment: '' });
  const [reviews, setReviews] = useState([]);
  const { userId } = useContext(AuthContext);
  const [ingredientsWithMeasurements, setIngredientsWithMeasurements] = useState([]);
  const [isEditingRecipe, setIsEditingRecipe] = useState(false);
  const [updatedRecipe, setUpdatedRecipe] = useState({ nome: recipe.nome, descricao: recipe.descricao, ingredientes: recipe.ingredientesReceita });
  const [userReview, setUserReview] = useState(null); 
  const [ingredients, setIngredients] = useState([]); 

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await getRecipeReviews(recipe.id);
        setReviews(response);
        const existingReview = response.find(r => r.idDoUsuario === Number(userId));
        if (existingReview) {
          setReview({ rating: existingReview.nota, comment: existingReview.comentario });
          setUserReview(existingReview); 
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchIngredients = async () => {
      try {
        const allIngredients = await getAllIngredients();
        setIngredients(allIngredients);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchIngredientsWithMeasurements = async () => {
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
    fetchIngredientsWithMeasurements();
  }, [recipe.id, recipe.ingredientesReceita, recipe.minFactor, userId]);

  const submitReview = async () => {
    try {
      if (userReview) {
        await updateReview(recipe.id, userId, {
          comentario: review.comment,
          nota: review.rating,
        });
        alert('Avaliação atualizada com sucesso!');
      } else {
        await addReview({
          comentario: review.comment,
          nota: review.rating,
          idDoUsuario: Number(userId),
          idDaReceita: Number(recipe.id)
        });
        alert('Avaliação enviada com sucesso!');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar/atualizar avaliação.');
    }
  };

  const handleUpdateRecipe = async () => {
    try {
      await updateRecipe(recipe.id, updatedRecipe);
      alert('Receita atualizada com sucesso!');
      setIsEditingRecipe(false);
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(recipe.id, reviewId);
      setReviews(reviews.filter((r) => r.idDoUsuario !== reviewId));
      alert('Avaliação apagada!');
      setUserReview(null);
      setReview({ rating: '', comment: '' });
    } catch (error) {
      console.error('Erro ao apagar avaliação:', error);
    }
  };

  const addIngredientField = () => {
    setUpdatedRecipe({
      ...updatedRecipe,
      ingredientes: [...updatedRecipe.ingredientes, { nomeDoIngrediente: '', quantidade: 0 }]
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...updatedRecipe.ingredientes];
    updatedIngredients[index][field] = value;
    setUpdatedRecipe({ ...updatedRecipe, ingredientes: updatedIngredients });
  };

  const handleDeleteIngredient = (index) => {
    const updatedIngredients = updatedRecipe.ingredientes.filter((_, i) => i !== index);
    setUpdatedRecipe({ ...updatedRecipe, ingredientes: updatedIngredients });
  };

  return (
    <div>
      {recipe && (
        <>
          {userId === recipe.idDoUsuario ? (
            <>
              {isEditingRecipe ? (
                <div>
                  <input
                    type="text"
                    value={updatedRecipe.nome}
                    onChange={(e) => setUpdatedRecipe({ ...updatedRecipe, nome: e.target.value })}
                    placeholder="Nome da Receita"
                  />
                  <input
                    type="text"
                    value={updatedRecipe.descricao}
                    onChange={(e) => setUpdatedRecipe({ ...updatedRecipe, descricao: e.target.value })}
                    placeholder="Descrição da Receita"
                  />

                  <h4>Editar Ingredientes</h4>
                  <div style={{ maxHeight: '200px', overflowY: 'scroll' }}>
                    {updatedRecipe.ingredientes.map((ingredient, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                        <select
                          value={ingredient.nomeDoIngrediente}
                          onChange={(e) => handleIngredientChange(index, 'nomeDoIngrediente', e.target.value)}
                          style={{ marginRight: '10px' }}
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
                          onChange={(e) => handleIngredientChange(index, 'quantidade', Number(e.target.value))}
                          style={{ marginRight: '10px' }}
                        />
                        <button onClick={() => handleDeleteIngredient(index)} style={{ backgroundColor: 'red', color: 'white' }}>
                          Apagar
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addIngredientField}>Adicionar Ingrediente</button>
                  <button onClick={handleUpdateRecipe}>Salvar Alterações</button>
                </div>
              ) : (
                <div>
                  <h2>{recipe.nome}</h2>
                  <p>{recipe.descricao}</p>
                  <button onClick={() => setIsEditingRecipe(true)}>Editar Receita</button>
                </div>
              )}
            </>
          ) : (
            <>
              <h2>{recipe.nome}</h2>
              <p>{recipe.descricao}</p>
            </>
          )}

          <h3>Ingredientes</h3>
          <ul>
            {ingredientsWithMeasurements.map(ingredient => (
              <li key={ingredient.idDaReceita}>
                {ingredient.nomeDoIngrediente}: {ingredient.quantidadeAjustada} {ingredient.tipoDeMedida}
                {(recipe.minFactor && recipe.minFactor !== 1) && (
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
                {r.idDoUsuario === userId && (
                  <div>
                    <button onClick={() => handleDeleteReview(r.idDoUsuario)}>Apagar Avaliação</button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>Sem avaliações ainda.</p>
          )}

          <h4>{userReview ? 'Atualizar Avaliação' : 'Avaliar Receita'}</h4>
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
          <button onClick={submitReview}>{userReview ? 'Atualizar Avaliação' : 'Enviar Avaliação'}</button>
        </>
      )}
    </div>
  );
}

export default RecipeDetails;
