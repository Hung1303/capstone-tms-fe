import { router } from './router/router'
import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ConsultationProvider from './contexts/ConsultationContext';

function App() {

  return (
    <>
      <ToastContainer />
      <ConsultationProvider>
        <RouterProvider router={router}/>
      </ConsultationProvider>
    </>
  )
}

export default App