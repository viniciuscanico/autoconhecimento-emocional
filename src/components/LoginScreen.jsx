import React, { useState } from 'react';
import { loginWithGoogle } from '../firebase/authManager';

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Não foi possível fazer login. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-sm flex flex-col items-center gap-6">
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Autoconhecimento Emocional</h1>
          <p className="text-gray-500 text-sm mt-2">Seus dados salvos na nuvem, com segurança</p>
        </div>

        <div className="text-6xl">🌱</div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-6 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:shadow-md transition-all disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          <span className="font-semibold text-gray-700">
            {loading ? 'Entrando...' : 'Entrar com Google'}
          </span>
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <p className="text-xs text-gray-400 text-center">
          Ao entrar, você concorda que seus registros emocionais serão salvos de forma privada e segura.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;