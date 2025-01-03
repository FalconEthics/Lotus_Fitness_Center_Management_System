import {useEffect} from 'react';
import {useNavigate} from 'react-router';
import {useDispatch, useSelector} from 'react-redux';
import {setDataset} from '../store/datasetSlice';
import {Suspense} from 'react';
import {Loading} from "../Reusable_Components/Loading.jsx";

// This fuction is a higher order component that wraps all the pages that require authentication and a dataset.
const WithAuthAndDataset = (WrappedComponent) => {

  const ComponentWithAuthAndDataset = (props) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // Get the dataset from the Redux store.
    const dataset = useSelector(state => state.dataset);

    // Check if the user is authenticated, if not, redirect to the login page.
    useEffect(() => {
      if (localStorage.getItem('auth') !== 'true') {
        navigate('/login');
      }

      // checks onload and on every change of route
    }, [navigate]);

    // This uploads the dataset file and sets the dataset in the Redux store.
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        dispatch(setDataset(data));
      };
      reader.readAsText(file);
    };

    // If the dataset is empty, shows a upload modal
    if (dataset.members.length === 0 && dataset.classes.length === 0) {
      return (
        <div className="w-full h-full flex flex-col space-y-6 justify-start p-6 text-gray-800">
          <h1 className="text-2xl font-bold text-red-600">Dataset not found!</h1>
          <p className="text-lg">Please upload a dataset to view the dashboard.</p>
          <input type="file" accept=".json" onChange={handleFileUpload}/>
        </div>
      );
    }

    // In case the dataset is not empty, renders the wrapped component i.e. the pages!
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