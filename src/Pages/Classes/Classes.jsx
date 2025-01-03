import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {addClass, updateClass, deleteClass} from '../../store/datasetSlice';
import {SiGoogleclassroom} from "react-icons/si";
import {GrAdd} from "react-icons/gr";
import {AiFillCloseCircle, AiOutlineOrderedList, AiOutlineUser} from "react-icons/ai";

export function Classes() {
  const dispatch = useDispatch();
  const classes = useSelector(state => state.dataset.classes);
  const members = useSelector(state => state.dataset.members);
  const [newClass, setNewClass] = useState({name: '', instructor: '', schedule: '', capacity: 0});
  const [editingClass, setEditingClass] = useState(null);
  const [memberToAdd, setMemberToAdd] = useState(null);

  const handleAddClass = () => {
    if (newClass.name === '' || newClass.instructor === '' || newClass.schedule === '' || newClass.capacity === 0) {
      alert('Please fill all fields');
      return;
    }
    dispatch(addClass({...newClass, id: Date.now(), enrolled: []}));
    setNewClass({name: '', instructor: '', schedule: '', capacity: 0});
  };

  const handleUpdateClass = () => {
    if (editingClass.name === '' || editingClass.instructor === '' || editingClass.schedule === '' || editingClass.capacity === 0) {
      alert('Please fill all fields');
      return;
    }
    dispatch(updateClass(editingClass));
    setEditingClass(null);
  };

  const handleDeleteClass = (id) => {
    dispatch(deleteClass(id));
  };

  const handleAddMemberToClass = (classId) => {
    if (memberToAdd) {
      const updatedClass = classes.find(cls => cls.id === classId);
      if (updatedClass.enrolled.length < updatedClass.capacity) {
        const newEnrolled = [...updatedClass.enrolled, memberToAdd];
        dispatch(updateClass({...updatedClass, enrolled: newEnrolled}));
        setMemberToAdd(null);
      } else {
        alert('Class is full');
      }
    }
  };


  return (
    <div className="w-full h-full flex flex-col space-y-6 justify-start p-6 text-gray-800 overflow-y-auto pb-36">
      <h1 className="text-2xl font-bold flex flex-row items-center">
        <SiGoogleclassroom className="inline-block mr-2"/>
        <p>Manage Classes</p>
      </h1>
      <div className="flex flex-col space-y-4 border p-6 shadow-lg rounded-xl">
        <h2 className="text-xl font-bold flex flex-row items-center">
          <GrAdd className="inline-block mr-2"/>
          <p>Add New Class</p>
        </h2>
        <input
          type="text"
          placeholder="Class Name"
          value={newClass.name}
          className={"border p-2 rounded"}
          onChange={(e) => setNewClass({...newClass, name: e.target.value})}
        />
        <input
          type="text"
          placeholder="Instructor"
          className={"border p-2 rounded"}
          value={newClass.instructor}
          onChange={(e) => setNewClass({...newClass, instructor: e.target.value})}
        />
        <input
          type="text"
          placeholder="Schedule"
          className={"border p-2 rounded"}
          value={newClass.schedule}
          onChange={(e) => setNewClass({...newClass, schedule: e.target.value})}
        />
        <div className="flex flex-row items-center justify-between">
          <label htmlFor="capacity">Capacity</label>
          <span>{newClass.capacity}</span>
        </div>
        <input
          type={"range"}
          placeholder="Capacity"
          className={"border p-2 rounded"}
          min={0}
          max={50}
          value={newClass.capacity}
          onChange={(e) => setNewClass({...newClass, capacity: parseInt(e.target.value)})}
        />
        <button onClick={handleAddClass} className="bg-blue-500 text-white p-2 rounded">Add Class</button>
      </div>
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold flex flex-row items-center">
          <AiOutlineOrderedList className="inline-block mr-2"/>
          <p>Class List</p>
        </h2>
        {classes.map(cls => (
          <div key={cls.id} className="p-6 rounded-lg flex flex-col space-y-4 bg-gray-800 text-white shadow-xl">
            {editingClass && editingClass.id === cls.id ? (
              <>
                <input
                  type="text"
                  placeholder="Class Name"
                  value={editingClass.name}
                  className={"border p-2 rounded text-black"}
                  onChange={(e) => setEditingClass({...editingClass, name: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Instructor"
                  className={"border p-2 rounded text-black"}
                  value={editingClass.instructor}
                  onChange={(e) => setEditingClass({...editingClass, instructor: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Schedule"
                  className={"border p-2 rounded text-black"}
                  value={editingClass.schedule}
                  onChange={(e) => setEditingClass({...editingClass, schedule: e.target.value})}
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  className={"border p-2 rounded text-black"}
                  value={editingClass.capacity}
                  onChange={(e) => setEditingClass({...editingClass, capacity: parseInt(e.target.value)})}
                />
                <button onClick={handleUpdateClass} className="bg-blue-500 text-white p-2 rounded">Update Class</button>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-bold">{cls.name} Class</h3>
                <p>Instructor: {cls.instructor}</p>
                <p>Schedule: {cls.schedule}</p>
                <p>Capacity: {cls.capacity}</p>
                <p>Enrolled: {cls.enrolled.length}</p>
                <div className={"flex flex-row w-full"}>
                  <button onClick={() => setEditingClass(cls)}
                          className="bg-white text-gray-800 p-2 rounded w-1/2 mr-2">Edit
                  </button>
                  <button onClick={() => handleDeleteClass(cls.id)}
                          className="bg-red-500 text-white p-2 rounded w-1/2">Delete
                  </button>
                </div>
              </>
            )}
            <h4 className="text-md font-bold">Add Member</h4>
            <div className="flex flex-row space-x-2">
              <select
                className={"border p-2 rounded w-1/2 text-black p-2"}
                onChange={(e) => setMemberToAdd(parseInt(e.target.value))} value={memberToAdd || ''}>
                <option value="" disabled>Select Member</option>
                {members.filter(member => !cls.enrolled.includes(member.id)).map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
              <button onClick={() => handleAddMemberToClass(cls.id)}
                      className="bg-green-500 text-white p-2 rounded w-1/2">Add
                Member
              </button>
            </div>
            <h4 className="text-md font-bold">Enrolled Members</h4>
            <div className="grid grid-cols-5 gap-4">
              {cls.enrolled.map(memberId => {
                const member = members.find(m => m.id === memberId);
                return <div key={memberId} className="flex flex-row items-center space-x-2">
                  <AiOutlineUser className="inline-block text-4xl rounded-full bg-gray-500 p-2"/>
                  <p>{member.name}</p>
                </div>;
              })}
              {cls.enrolled.length === 0 && <div className={"flex flex-row items-center space-x-2"}>
                <AiFillCloseCircle className="inline-block text-4xl text-white"/>
                <p>No members enrolled</p>
              </div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}