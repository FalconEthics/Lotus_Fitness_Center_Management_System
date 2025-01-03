import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {addMember, updateMember, deleteMember, updateClass} from '../../store/datasetSlice';
import {AiOutlineUser, AiFillCloseCircle, AiOutlineOrderedList} from "react-icons/ai";
import {GrAdd} from "react-icons/gr";
import {SiGoogleclassroom} from "react-icons/si";

export function Members() {
  const dispatch = useDispatch();
  const members = useSelector(state => state.dataset.members);
  const classes = useSelector(state => state.dataset.classes);
  const [newMember, setNewMember] = useState({name: '', email: '', phone: '', membershipType: '', startDate: ''});
  const [editingMember, setEditingMember] = useState(null);
  const [classToAdd, setClassToAdd] = useState(null);

  const membershipTypes = ['Basic', 'Premium', 'VIP'];

  const handleAddMember = () => {
    if (newMember.name === '' || newMember.email === '' || newMember.phone === '' || newMember.membershipType === '' || newMember.startDate === '') {
      alert('Please fill all fields');
      return;
    }
    dispatch(addMember({...newMember, id: Date.now()}));
    setNewMember({name: '', email: '', phone: '', membershipType: '', startDate: ''});
  };

  const handleUpdateMember = () => {
    if (editingMember.name === '' || editingMember.email === '' || editingMember.phone === '' || editingMember.membershipType === '' || editingMember.startDate === '') {
      alert('Please fill all fields');
      return;
    }
    dispatch(updateMember(editingMember));
    setEditingMember(null);
  };

  const handleDeleteMember = (id) => {
    dispatch(deleteMember(id));
  };

  const handleAddMemberToClass = (memberId) => {
    if (classToAdd) {
      const updatedClass = classes.find(cls => cls.id === classToAdd);
      if (updatedClass.enrolled.length < updatedClass.capacity) {
        const newEnrolled = [...updatedClass.enrolled, memberId];
        dispatch(updateClass({...updatedClass, enrolled: newEnrolled}));
        setClassToAdd(null);
      } else {
        alert('Class is full');
      }
    }
  };


  return (
    <div className="w-full h-full flex flex-col space-y-6 justify-start p-6 text-gray-800 overflow-y-auto pb-36">
      <h1 className="text-2xl font-bold flex flex-row items-center">
        <AiOutlineUser className="inline-block mr-2"/>
        <p>Manage Members</p>
      </h1>
      <div className="flex flex-col space-y-4 border p-6 shadow-lg rounded-xl">
        <h2 className="text-xl font-bold flex flex-row items-center">
          <GrAdd className="inline-block mr-2"/>
          <p>Add New Member</p>
        </h2>
        <input
          type="text"
          placeholder="Name"
          value={newMember.name}
          className={"border p-2 rounded"}
          onChange={(e) => setNewMember({...newMember, name: e.target.value})}
        />
        <input
          type="email"
          placeholder="Email"
          className={"border p-2 rounded"}
          value={newMember.email}
          onChange={(e) => setNewMember({...newMember, email: e.target.value})}
        />
        <input
          type="text"
          placeholder="Phone"
          className={"border p-2 rounded"}
          value={newMember.phone}
          onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
        />
        <select
          className={"border p-2 rounded"}
          value={newMember.membershipType}
          onChange={(e) => setNewMember({...newMember, membershipType: e.target.value})}
        >
          <option value="" disabled>Select Membership Type</option>
          {membershipTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input
          type="date"
          placeholder="Start Date"
          className={"border p-2 rounded"}
          value={newMember.startDate}
          onChange={(e) => setNewMember({...newMember, startDate: e.target.value})}
        />
        <button onClick={handleAddMember} className="bg-blue-500 text-white p-2 rounded">Add Member</button>
      </div>
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold flex flex-row items-center">
          <AiOutlineOrderedList className="inline-block mr-2"/>
          <p>Member List</p>
        </h2>
        {members.map(member => (
          <div key={member.id} className="p-6 rounded-lg flex flex-col space-y-4 bg-gray-800 text-white shadow-xl">
            {editingMember && editingMember.id === member.id ? (
              <>
                <input
                  type="text"
                  placeholder="Name"
                  value={editingMember.name}
                  className={"border p-2 rounded text-black"}
                  onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className={"border p-2 rounded text-black"}
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Phone"
                  className={"border p-2 rounded text-black"}
                  value={editingMember.phone}
                  onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                />
                <select
                  className={"border p-2 rounded text-black"}
                  value={editingMember.membershipType}
                  onChange={(e) => setEditingMember({...editingMember, membershipType: e.target.value})}
                >
                  <option value="" disabled>Select Membership Type</option>
                  {membershipTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  type="date"
                  placeholder="Start Date"
                  className={"border p-2 rounded text-black"}
                  value={editingMember.startDate}
                  onChange={(e) => setEditingMember({...editingMember, startDate: e.target.value})}
                />
                <button onClick={handleUpdateMember} className="bg-blue-500 text-white p-2 rounded">Update Member
                </button>
              </>
            ) : (
              <>
                <h3 className="text-3xl font-bold">{member.name}</h3>
                <p>Email: {member.email}</p>
                <p>Phone: {member.phone}</p>
                <p>Membership Type: {member.membershipType}</p>
                <p>Start Date: {member.startDate}</p>
                <div className={"flex flex-row w-full"}>
                  <button onClick={() => setEditingMember(member)}
                          className="bg-white text-gray-800 p-2 rounded w-1/2 mr-2">Edit
                  </button>
                  <button onClick={() => handleDeleteMember(member.id)}
                          className="bg-red-500 text-white p-2 rounded w-1/2">Delete
                  </button>
                </div>
              </>
            )}
            <h4 className="text-md font-bold">Add to Class</h4>
            <div className="flex flex-row space-x-2">
              <select
                className={"border p-2 rounded w-1/2 text-black p-2"}
                onChange={(e) => setClassToAdd(parseInt(e.target.value))} value={classToAdd || ''}>
                <option value="" disabled>Select Class</option>
                {classes.filter(cls => !cls.enrolled.includes(member.id) && cls.enrolled.length < cls.capacity).map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
              <button onClick={() => handleAddMemberToClass(member.id)}
                      className="bg-green-500 text-white p-2 rounded w-1/2">Add to Class
              </button>
            </div>
            <h4 className="text-md font-bold">Enrolled Classes</h4>
            <div className="grid grid-cols-5 gap-4">
              {classes.filter(cls => cls.enrolled.includes(member.id)).map(cls => (
                <div key={cls.id} className="flex flex-row items-center space-x-2">
                  <SiGoogleclassroom className="inline-block text-4xl text-white"/>
                  <p>{cls.name}</p>
                </div>
              ))}
              {classes.filter(cls => cls.enrolled.includes(member.id)).length === 0 && (
                <div className={"flex flex-row items-center space-x-2"}>
                  <AiFillCloseCircle className="inline-block text-4xl text-white"/>
                  <p>Not Enrolled in any Classes</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}