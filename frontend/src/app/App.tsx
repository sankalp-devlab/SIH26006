import { RouterProvider } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { ApiStatusProvider } from '../features/api-status/ApiStatusContext';
import { router } from './router';

export function App() {
  return (
    <QueryProvider>
      <ApiStatusProvider>
        <RouterProvider router={router} />
      </ApiStatusProvider>
    </QueryProvider>
  );
}
