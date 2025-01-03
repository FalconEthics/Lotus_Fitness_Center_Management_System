import {useLayoutEffect} from 'react';
import {useNavigate} from 'react-router';
import {useDispatch, useSelector} from 'react-redux';
import {setDataset} from '../../store/datasetSlice';
import {
  AiFillDashboard,
  AiOutlineMenu,
  AiOutlineUser, AiOutlineUserAdd,
  AiOutlineUsergroupAdd,
} from 'react-icons/ai';
import {MdEventSeat} from 'react-icons/md';
import {CgAdd} from 'react-icons/cg';
import {BiSolidUser} from 'react-icons/bi';

export function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dataset = useSelector(state => state.dataset);

  useLayoutEffect(() => {
    if (localStorage.getItem('auth') !== 'true') {
      navigate('/login');
    }
  }, []);

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
    <div className="w-full h-full flex flex-col space-y-6 justify-start p-6 text-gray-800">
      <div className="flex flex-row items-center space-x-2">
        <AiFillDashboard className="text-4xl"/>
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      <div className="flex flex-row items-center space-x-2 justify-start">
        <div className="border shadow-lg p-6 rounded-lg flex flex-col space-y-2 items-center">
          <div className="flex flex-row items-center space-x-2">
            <AiOutlineUsergroupAdd className="text-2xl"/>
            <h1 className="text-xl font-bold">Total Users</h1>
          </div>
          <h1 className="text-4xl font-bold">{dataset.members.length}</h1>
        </div>
        <div className="border shadow-lg p-6 rounded-lg flex flex-col space-y-2 items-center">
          <div className="flex flex-row items-center space-x-2">
            <AiOutlineMenu className="text-2xl"/>
            <h1 className="text-xl font-bold">Total Classes</h1>
          </div>
          <h1 className="text-4xl font-bold">{dataset.classes.length}</h1>
        </div>
        <div className="border shadow-lg p-6 rounded-lg flex flex-col space-y-2 items-center">
          <div className="flex flex-row items-center space-x-2">
            <MdEventSeat className="text-2xl"/>
            <h1 className="text-xl font-bold">Available Seats</h1>
          </div>
          <h1 className="text-4xl font-bold">
            {dataset.classes.reduce((acc, cls) => acc + (cls.capacity - cls.enrolled.length), 0)}
          </h1>
        </div>
        <div className="border shadow-lg p-6 rounded-lg flex flex-col space-y-2 items-center">
          <div className="flex flex-row items-center space-x-2">
            <AiOutlineUserAdd className="text-2xl"/>
            <h1 className="text-xl font-bold">Unassigned Users</h1>
          </div>
          <h1 className="text-4xl font-bold">
            {dataset.members.filter(member => !dataset.classes.some(cls => cls.enrolled.includes(member.id))).length}
          </h1>
        </div>
        <button
          onClick={() => {
            alert('Feature not available yet!');
          }}
          className="border shadow-lg p-6 rounded-lg flex flex-col space-y-2 items-center bg-gray-800 text-white hover:scale-95"
        >
          <div className="flex flex-row items-center space-x-2">
            <CgAdd className="text-4xl"/>
          </div>
          <h1 className="text-2xl font-bold">add more cards!</h1>
        </button>
      </div>
      <div className="flex flex-row items-center space-x-2">
        <AiOutlineUser className="text-4xl"/>
        <h1 className="text-2xl font-bold">Recently Joined</h1>
      </div>
      <div className="flex flex-row items-center space-x-2 justify-start overflow-x-auto">
        {dataset.members.slice(0, 7).map(member => (
          <div key={member.id} className="border shadow-lg p-6 rounded-lg flex flex-col space-y-2 items-center w-80">
            <div className="flex flex-col justify-center items-center space-y-2">
              <BiSolidUser className="text-6xl border rounded-full shadow-lg p-2"/>
              <h1 className="text-xl font-bold">{member.name}</h1>
            </div>
            <div className="border-t-2 pt-2 w-full">
              <div className="flex flex-col">
                <h1 className="text-gray-500">Member Id:</h1>
                <p className="text-lg font-bold">{member.id}</p>
              </div>
              <div className="flex flex-col">
                <h1 className="text-gray-500">Email:</h1>
                <p className="text-lg font-bold">{member.email}</p>
              </div>
              <div className="flex flex-col">
                <h1 className="text-gray-500">Phone Number:</h1>
                <p className="text-lg font-bold">{member.phone}</p>
              </div>
              <div className="flex flex-col">
                <h1 className="text-gray-500">Membership Type:</h1>
                <p className="text-lg font-bold">{member.membershipType}</p>
              </div>
              <div className="flex flex-col">
                <h1 className="text-gray-500">Membership Start Date:</h1>
                <p className="text-lg font-bold">{member.startDate}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}