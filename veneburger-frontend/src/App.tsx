import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Provider } from 'react-redux';
import { store } from './store';

function App() {
  useEffect(() => {
    // Verificar si hay un token en localStorage para mantener la sesión
    const token = localStorage.getItem('token');
    // Aquí podrías añadir lógica para verificar la validez del token
  }, []);

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;