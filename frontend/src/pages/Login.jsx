import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useEffect } from 'react';

function Login({ setPrenom }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState('');
  const navigate = useNavigate();
useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'auto' }); // ← on met "auto" pour forcer, plus fiable
}, []);

useEffect(() => {
  const bgPosition = { current: 0 };
  const targetPosition = { current: 0 };
  let requestRef;

  const handleScroll = () => {
    targetPosition.current = window.scrollY * 0.3;
  };

  const animate = () => {
    bgPosition.current += (targetPosition.current - bgPosition.current) * 0.08;

    const login = document.querySelector('.login-page');
    if (login) {
      login.style.backgroundPosition = `center ${-bgPosition.current}px`;
    }

    requestRef = requestAnimationFrame(animate);
  };

  window.addEventListener('scroll', handleScroll);
  requestRef = requestAnimationFrame(animate);

  return () => {
    window.removeEventListener('scroll', handleScroll);
    cancelAnimationFrame(requestRef);
  };
}, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/auth/login', {
        email,
        password
      });

      const token = response.data.token;

      if (!token) {
        setErreur("Erreur : aucun token reçu");
        return;
      }

      localStorage.setItem("token", token);

      const userResponse = await axios.get('http://localhost:8080/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const prenom = userResponse.data.firstName;
      const role = userResponse.data.role;
        localStorage.setItem("role", role);
      setPrenom(prenom);
      localStorage.setItem("prenom", prenom);
      if (role === 'author') {
  navigate('/mes-livres');
} else {
  navigate('/');
}

    } catch (err) {
      setErreur("Email ou mot de passe incorrect.");
    }
  };


   return (
    
    <div className="login-page">
     
      <div className="login-container">
        <h2>Connexion</h2>
        {erreur && <p>{erreur}</p>}
        <form onSubmit={handleLogin}>
          <div>
            <label>Email :</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Mot de passe :</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Se connecter</button>
        </form>
        <div className="create-account-box">
  <p>Pas encore de compte ?</p>
  <button className="create-account-btn" onClick={() => navigate('/create-account')}>
    Créer un compte
  </button>
</div>
      </div>
    </div>
  );
}

export default Login;
