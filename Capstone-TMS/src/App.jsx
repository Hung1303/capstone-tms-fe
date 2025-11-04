import { router } from './router/router'
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';

function App() {

  return (
    <AuthProvider>
      <ToastContainer />
      <RouterProvider router={router}/>
    </AuthProvider>
  )
}

export default App
