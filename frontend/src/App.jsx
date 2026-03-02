import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Header from './components/Header';
import Home from './pages/Home';
import MesLivres from './pages/MesLivres';
import PrivateRoute from './components/PrivateRoute';
import Footer from './components/Footer'; // 👈 à ajouter
import CreateAccount from './pages/CreateAccount'; // 👈 à importer
import Profil from './pages/Profil';
import PaymentPage from "./pages/PaymentPage";

function App() {
  const [prenom, setPrenom] = useState(() => {
    return localStorage.getItem("prenom");
  });

  return (
    <div className="app-layout"> {/* ✅ Nouveau wrapper */}
      <Header prenom={prenom} setPrenom={setPrenom} />

      <main className="main-content"> {/* ✅ Extensible */}
        <Routes>
          <Route path="/mes-livres" element={<PrivateRoute requiredRole="author"><MesLivres /></PrivateRoute>} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login setPrenom={setPrenom} />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/profil" element={<PrivateRoute><Profil /></PrivateRoute>} />
           <Route path="/paiement" element={<PaymentPage onSuccess={() => navigate("/profil")} onCancel={() => navigate(-1)} />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
