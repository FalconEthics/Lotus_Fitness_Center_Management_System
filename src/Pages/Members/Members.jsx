import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {addMember, updateMember, deleteMember, updateClass} from '../../store/datasetSlice';

export function Members() {
  const dispatch = useDispatch();
  const members = useSelector(state => state.dataset.members);
  const classes = useSelector(state => state.dataset.classes);
  const [newMember, setNewMember] = useState({name: '', email: '', phone: '', membershipType: '', startDate: ''});
  const [selectedMember, setSelectedMember] = useState(null);
  const [classToAdd, setClassToAdd] = useState(null);

  const handleAddMember = () => {
    dispatch(addMember({...newMember, id: Date.now()}));
    setNewMember({name: '', email: '', phone: '', membershipType: '', startDate: ''});
  };

  const handleUpdateMember = () => {
    dispatch(updateMember(selectedMember));
    setSelectedMember(null);
  };

  const handleDeleteMember = (id) => {
    dispatch(deleteMember(id));
  };

  const handleAddMemberToClass = (memberId) => {
    if (classToAdd) {
      const updatedClass = classes.find(cls => cls.id === classToAdd);
      if (updatedClass.enrolled.length < updatedClass.capacity) {
        updatedClass.enrolled.push(memberId);
        dispatch(updateClass(updatedClass));
        setClassToAdd(null);
      } else {
        alert('Class is full');
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6 justify-start p-6 text-gray-800 overflow-y-auto pb-36">
      <h1 className="text-2xl font-bold">Manage Members</h1>
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold">Add New Member</h2>
        <input
          type="text"
          placeholder="Name"
          value={newMember.name}
          onChange={(e) => setNewMember({...newMember, name: e.target.value})}
        />
        <input
          type="email"
          placeholder="Email"
          value={newMember.email}
          onChange={(e) => setNewMember({...newMember, email: e.target.value})}
        />
        <input
          type="text"
          placeholder="Phone"
          value={newMember.phone}
          onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
        />
        <input
          type="text"
          placeholder="Membership Type"
          value={newMember.membershipType}
          onChange={(e) => setNewMember({...newMember, membershipType: e.target.value})}
        />
        <input
          type="date"
          placeholder="Start Date"
          value={newMember.startDate}
          onChange={(e) => setNewMember({...newMember, startDate: e.target.value})}
        />
        <button onClick={handleAddMember} className="bg-blue-500 text-white p-2 rounded">Add Member</button>
      </div>
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold">Member List</h2>
        {members.map(member => (
          <div key={member.id} className="border p-4 rounded flex flex-col space-y-2">
            <h3 className="text-lg font-bold">{member.name}</h3>
            <p>Email: {member.email}</p>
            <p>Phone: {member.phone}</p>
            <p>Membership Type: {member.membershipType}</p>
            <p>Start Date: {member.startDate}</p>
            <button onClick={() => setSelectedMember(member)} className="bg-yellow-500 text-white p-2 rounded">Edit
            </button>
            <button onClick={() => handleDeleteMember(member.id)} className="bg-red-500 text-white p-2 rounded">Delete
            </button>
            <div className="flex flex-col space-y-2">
              <h4 className="text-md font-bold">Add to Class</h4>
              <select onChange={(e) => setClassToAdd(parseInt(e.target.value))} value={classToAdd || ''}>
                <option value="" disabled>Select Class</option>
                {classes.filter(cls => !cls.enrolled.includes(member.id) && cls.enrolled.length < cls.capacity).map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
              <button onClick={() => handleAddMemberToClass(member.id)}
                      className="bg-green-500 text-white p-2 rounded">Add to Class
              </button>
            </div>
            <div className="flex flex-col space-y-2">
              <h4 className="text-md font-bold">Enrolled Classes</h4>
              {classes.filter(cls => cls.enrolled.includes(member.id)).map(cls => (
                <p key={cls.id}>{cls.name}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selectedMember && (
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold">Edit Member</h2>
          <input
            type="text"
            placeholder="Name"
            value={selectedMember.name}
            onChange={(e) => setSelectedMember({...selectedMember, name: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email"
            value={selectedMember.email}
            onChange={(e) => setSelectedMember({...selectedMember, email: e.target.value})}
          />
          <input
            type="text"
            placeholder="Phone"
            value={selectedMember.phone}
            onChange={(e) => setSelectedMember({...selectedMember, phone: e.target.value})}
          />
          <input
            type="text"
            placeholder="Membership Type"
            value={selectedMember.membershipType}
            onChange={(e) => setSelectedMember({...selectedMember, membershipType: e.target.value})}
          />
          <input
            type="date"
            placeholder="Start Date"
            value={selectedMember.startDate}
            onChange={(e) => setSelectedMember({...selectedMember, startDate: e.target.value})}
          />
          <button onClick={handleUpdateMember} className="bg-blue-500 text-white p-2 rounded">Update Member</button>
        </div>
      )}
    </div>
  );
}