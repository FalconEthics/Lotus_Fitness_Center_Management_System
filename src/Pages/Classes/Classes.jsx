import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {addClass, updateClass, deleteClass} from '../../store/datasetSlice';

export function Classes() {
  const dispatch = useDispatch();
  const classes = useSelector(state => state.dataset.classes);
  const members = useSelector(state => state.dataset.members);
  const [newClass, setNewClass] = useState({name: '', instructor: '', schedule: '', capacity: 0});
  const [selectedClass, setSelectedClass] = useState(null);
  const [memberToAdd, setMemberToAdd] = useState(null);

  const handleAddClass = () => {
    dispatch(addClass({...newClass, id: Date.now(), enrolled: []}));
    setNewClass({name: '', instructor: '', schedule: '', capacity: 0});
  };

  const handleUpdateClass = () => {
    dispatch(updateClass(selectedClass));
    setSelectedClass(null);
  };

  const handleDeleteClass = (id) => {
    dispatch(deleteClass(id));
  };

  const handleAddMemberToClass = (classId) => {
    if (memberToAdd) {
      const updatedClass = classes.find(cls => cls.id === classId);
      if (updatedClass.enrolled.length < updatedClass.capacity) {
        updatedClass.enrolled.push(memberToAdd);
        dispatch(updateClass(updatedClass));
        setMemberToAdd(null);
      } else {
        alert('Class is full');
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6 justify-start p-6 text-gray-800 overflow-y-auto pb-36">
      <h1 className="text-2xl font-bold">Manage Classes</h1>
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold">Add New Class</h2>
        <input
          type="text"
          placeholder="Class Name"
          value={newClass.name}
          onChange={(e) => setNewClass({...newClass, name: e.target.value})}
        />
        <input
          type="text"
          placeholder="Instructor"
          value={newClass.instructor}
          onChange={(e) => setNewClass({...newClass, instructor: e.target.value})}
        />
        <input
          type="text"
          placeholder="Schedule"
          value={newClass.schedule}
          onChange={(e) => setNewClass({...newClass, schedule: e.target.value})}
        />
        <input
          type="number"
          placeholder="Capacity"
          value={newClass.capacity}
          onChange={(e) => setNewClass({...newClass, capacity: parseInt(e.target.value)})}
        />
        <button onClick={handleAddClass} className="bg-blue-500 text-white p-2 rounded">Add Class</button>
      </div>
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold">Class List</h2>
        {classes.map(cls => (
          <div key={cls.id} className="border p-4 rounded flex flex-col space-y-2">
            <h3 className="text-lg font-bold">{cls.name}</h3>
            <p>Instructor: {cls.instructor}</p>
            <p>Schedule: {cls.schedule}</p>
            <p>Capacity: {cls.capacity}</p>
            <p>Enrolled: {cls.enrolled.length}</p>
            <button onClick={() => setSelectedClass(cls)} className="bg-yellow-500 text-white p-2 rounded">Edit</button>
            <button onClick={() => handleDeleteClass(cls.id)} className="bg-red-500 text-white p-2 rounded">Delete
            </button>
            <div className="flex flex-col space-y-2">
              <h4 className="text-md font-bold">Add Member</h4>
              <select onChange={(e) => setMemberToAdd(parseInt(e.target.value))} value={memberToAdd || ''}>
                <option value="" disabled>Select Member</option>
                {members.filter(member => !cls.enrolled.includes(member.id)).map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
              <button onClick={() => handleAddMemberToClass(cls.id)} className="bg-green-500 text-white p-2 rounded">Add
                Member
              </button>
            </div>
            <div className="flex flex-col space-y-2">
              <h4 className="text-md font-bold">Enrolled Members</h4>
              {cls.enrolled.map(memberId => {
                const member = members.find(m => m.id === memberId);
                return <p key={memberId}>{member.name}</p>;
              })}
            </div>
          </div>
        ))}
      </div>
      {selectedClass && (
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold">Edit Class</h2>
          <input
            type="text"
            placeholder="Class Name"
            value={selectedClass.name}
            onChange={(e) => setSelectedClass({...selectedClass, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Instructor"
            value={selectedClass.instructor}
            onChange={(e) => setSelectedClass({...selectedClass, instructor: e.target.value})}
          />
          <input
            type="text"
            placeholder="Schedule"
            value={selectedClass.schedule}
            onChange={(e) => setSelectedClass({...selectedClass, schedule: e.target.value})}
          />
          <input
            type="number"
            placeholder="Capacity"
            value={selectedClass.capacity}
            onChange={(e) => setSelectedClass({...selectedClass, capacity: parseInt(e.target.value)})}
          />
          <button onClick={handleUpdateClass} className="bg-blue-500 text-white p-2 rounded">Update Class</button>
        </div>
      )}
    </div>
  );
}