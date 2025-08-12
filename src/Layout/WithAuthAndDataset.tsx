import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Suspense } from 'react';
import { Loading } from "../components/ui/Loading";
import { WithAuthAndDatasetProps } from '../types';
import { isAuthenticated } from '../utils/auth';

// This function is a higher order component that wraps all the pages that require authentication and a dataset.
const WithAuthAndDataset = <P extends WithAuthAndDatasetProps>(WrappedComponent: React.ComponentType<P>) => {

  const ComponentWithAuthAndDataset = (props: P): JSX.Element => {
    const navigate = useNavigate();

    // Check if the user is authenticated using the new secure auth system
    useEffect(() => {
      if (!isAuthenticated()) {
        navigate('/login');
      }
    }, [navigate]);

    // The app can now operate with empty data - no forced upload required
    // Import/export functionality is available in the Profile page as an optional feature

    // Render the wrapped component (all pages work with empty data)
    return (
      <Suspense fallback={<Loading/>}>
        <WrappedComponent {...props} />
      </Suspense>
    );
  };

  // This is just to give the component a display name for debugging purposes.
  ComponentWithAuthAndDataset.displayName = `WithAuthAndDataset(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ComponentWithAuthAndDataset;
};

export default WithAuthAndDataset;