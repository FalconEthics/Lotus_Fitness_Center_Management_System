import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {addMember, deleteMember, updateClass, updateMember} from '../../store/datasetSlice';
import {AiOutlineOrderedList, AiOutlineUser} from "react-icons/ai";
import {GrAdd} from "react-icons/gr";
import {FormInput} from "../../Reusable_Components/FormInput.jsx";
import {showEditFields} from "./Components/ShowEditFields.jsx";
import {showValueFields} from "./Components/ShowValueFields.jsx";
import {AddClasses} from "./Components/AddClasses.jsx";
import {EnrolledClassesCard} from "./Components/EnrolledClassesCard.jsx";

export function Members() {
  const dispatch = useDispatch();
  // Get the members and classes from the Redux store
  const members = useSelector(state => state.dataset.members);
  const classes = useSelector(state => state.dataset.classes);

  // to manage the state of the new member being added
  const [newMember, setNewMember] = useState({name: '', email: '', phone: '', membershipType: '', startDate: ''});
  // to identify the member being edited (when null, no member is being edited)
  const [editingMember, setEditingMember] = useState(null);
  // to store the class id to add the member to
  const [classToAdd, setClassToAdd] = useState(null);

  // changes to this array will be reflected in the select dropdown
  const membershipTypes = ['Basic', 'Premium', 'VIP'];

  // validate email and phone number formats
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  const validatePhone = (phone) => {
    const re = /^\d{10}$/;
    return re.test(String(phone));
  };

  // functions to handle adding, updating, and deleting members
  const handleAddMember = () => {

    //Basic validation
    if (newMember.name === '' || newMember.email === '' || newMember.phone === '' || newMember.membershipType === '' || newMember.startDate === '') {
      alert('Please fill all fields');
      return;
    }
    if (!validateEmail(newMember.email)) {
      alert('Please enter a valid email address');
      return;
    }
    if (!validatePhone(newMember.phone)) {
      alert('Please enter a valid phone number (10 digits)');
      return;
    }

    //dispatch the addMember action with the new member object and reset the newMember state
    dispatch(addMember({...newMember, id: Date.now()}));
    setNewMember({name: '', email: '', phone: '', membershipType: '', startDate: ''});
  };

  // function to handle updating a member
  const handleUpdateMember = () => {
    //Basic validation
    if (editingMember.name === '' || editingMember.email === '' || editingMember.phone === '' || editingMember.membershipType === '' || editingMember.startDate === '') {
      alert('Please fill all fields');
      return;
    }
    if (!validateEmail(editingMember.email)) {
      alert('Please enter a valid email address');
      return;
    }
    if (!validatePhone(editingMember.phone)) {
      alert('Please enter a valid phone number (10 digits)');
      return;
    }

    //dispatch the updateMember action with the updated member object and reset the editingMember state
    dispatch(updateMember(editingMember));
    setEditingMember(null);
  };

  const handleDeleteMember = (id) => {
    // just a confirmation dialog to confirm the delete action
    if (window.confirm('Are you sure you want to delete this member?')) {
      // dispatch the deleteMember action with the member id
      dispatch(deleteMember(id));
    } else {
      return;
    }
  };

  // function to add a member to a class
  const handleAddMemberToClass = (memberId) => {
    // shouldn't be empty
    if (classToAdd) {

      // find the class object to add the member to
      const updatedClass = classes.find(cls => cls.id === classToAdd);
      // check if the class is full, if so, alert the user
      if (updatedClass.enrolled.length < updatedClass.capacity) {
        // otherwise, add the member to the class and reset the classToAdd state
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
      {/* Add New Member Form */}
      <div className="flex flex-col space-y-4 border p-6 shadow-lg rounded-xl">
        <h2 className="text-xl font-bold flex flex-row items-center">
          <GrAdd className="inline-block mr-2"/>
          <p>Add New Member</p>
        </h2>
        <FormInput type="text" placeholder="Name" value={newMember.name}
                   onChange={(e) => setNewMember({...newMember, name: e.target.value})}/>
        <FormInput type="email" placeholder="Email" value={newMember.email}
                   onChange={(e) => setNewMember({...newMember, email: e.target.value})}/>
        <FormInput type="text" placeholder="Phone" value={newMember.phone}
                   onChange={(e) => setNewMember({...newMember, phone: e.target.value})}/>
        <FormInput type="select" placeholder="Select Membership Type" value={newMember.membershipType}
                   onChange={(e) => setNewMember({...newMember, membershipType: e.target.value})}
                   options={membershipTypes}/>
        <FormInput type="date" placeholder="Start Date" value={newMember.startDate}
                   onChange={(e) => setNewMember({...newMember, startDate: e.target.value})}/>
        <button onClick={handleAddMember} className="bg-blue-500 text-white p-2 rounded">Add Member</button>
      </div>
      {/* List of all members with options to edit, delete and add to class */}
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold flex flex-row items-center">
          <AiOutlineOrderedList className="inline-block mr-2"/>
          <p>Member List</p>
        </h2>
        {/* Loop through all the members and display their details */}
        {members.map(member => (
          <div key={member.id} className="p-6 rounded-lg flex flex-col space-y-4 bg-gray-800 text-white shadow-xl">
            {/* if the member in editingMember state is the current member, show the edit fields, else show the value fields */}
            {editingMember && editingMember.id === member.id
              ? showEditFields(editingMember, setEditingMember, membershipTypes, handleUpdateMember)
              : showValueFields(member, setEditingMember, handleDeleteMember)}
            {/* Add to Class Section */}
            <h4 className="text-md font-bold">Add to Class</h4>
            {AddClasses(setClassToAdd, classToAdd, classes, member, handleAddMemberToClass)}
            {/* Enrolled Classes Section */}
            <h4 className="text-md font-bold">Enrolled Classes</h4>
            {EnrolledClassesCard(classes, member)}
          </div>
        ))}
      </div>
    </div>
  );
}