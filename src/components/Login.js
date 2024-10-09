import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import {loginUser, getUserByEmail} from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setToken, setUserId, setNickname } = useContext(AuthContext);
  const history = useHistory();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(email, password);
      setToken(response.token);
      const user = await getUserByEmail(email);
      setUserId(user.id);
      setNickname(user.apelido);
      history.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
