import {useEffect} from 'react';
import {useNavigate} from 'react-router';
import {useDispatch, useSelector} from 'react-redux';
import {setDataset} from '../store/datasetSlice';
import {Suspense} from 'react';

const WithAuthAndDataset = (WrappedComponent) => {
  const ComponentWithAuthAndDataset = (props) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const dataset = useSelector(state => state.dataset);

    useEffect(() => {
      if (localStorage.getItem('auth') !== 'true') {
        navigate('/login');
      }
    }, [navigate]);

    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        dispatch(setDataset(data));
      };
      reader.readAsText(file);
    };

    if (dataset.members.length === 0 && dataset.classes.length === 0) {
      return (
        <div className="w-full h-full flex flex-col space-y-6 justify-start p-6 text-gray-800">
          <h1 className="text-2xl font-bold text-red-600">Dataset not found!</h1>
          <p className="text-lg">Please upload a dataset to view the dashboard.</p>
          <input type="file" accept=".json" onChange={handleFileUpload}/>
        </div>
      );
    }

    return (
      <Suspense fallback={<div>Loading...</div>}>
        <WrappedComponent {...props} />
      </Suspense>
    );
  };

  ComponentWithAuthAndDataset.displayName = `WithAuthAndDataset(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ComponentWithAuthAndDataset;
};

export default WithAuthAndDataset;