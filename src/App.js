import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import IngredientSearch from './components/IngredientSearch';
import Profile from './components/Profile';
import RecipeDetails from './components/RecipeDetails';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Switch>
          <Route path="/signup" component={Signup} />
          <Route path="/login" component={Login} />
          <Route path="/dashboard" component={IngredientSearch} />
          <Route path="/profile" component={Profile} />
          <Route path="/recipes/:id" component={RecipeDetails} />
          <Route path="/" component={IngredientSearch} />
        </Switch>
      </AuthProvider>
    </Router>
  );
}

export default App;