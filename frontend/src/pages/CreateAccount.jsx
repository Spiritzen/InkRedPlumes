import { useState, useEffect } from 'react';
import './CreateAccount.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateAccount() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    adresse: '',
    role: 'client',
  });

  const [erreur, setErreur] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/users/register', {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        adresse: form.adresse, // ✅ Ligne ajoutée
        role: form.role
      });

      if (response.status === 201) {
        navigate('/login');
      }
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la création du compte.');
    }
  };

  return (
    <div className="create-page">
      <div className="create-container">
        <h2>Créer un compte</h2>
        {erreur && <p className="error">{erreur}</p>}
        <form onSubmit={handleSubmit}>
             <div>
            <label>Nom :</label>
            <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
          <div>
            <label>Prénom :</label>
            <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
          </div>
      
          <div>
            <label>Adresse :</label>
            <input type="text" name="adresse" value={form.adresse} onChange={handleChange} required />
          </div>
          <div>
            <label>Email :</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label>Mot de passe :</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </div>
          <div>
            <label>Confirmation :</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
          </div>
          <div>
            <label>Rôle :</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="author">Vendeur</option>
              <option value="client">Acheteur</option>
            </select>
          </div>
          <button type="submit">S'inscrire</button>
        </form>
      </div>
    </div>
  );
}

export default CreateAccount;
