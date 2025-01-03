import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {addClass, deleteClass, updateClass} from '../../store/datasetSlice';
import {SiGoogleclassroom} from "react-icons/si";
import {GrAdd} from "react-icons/gr";
import {AiOutlineOrderedList} from "react-icons/ai";
import {FormInput} from "../../Reusable_Components/FormInput.jsx";
import {showEditFields} from "./Components/ShowEditFields.jsx";
import {showValueFields} from "./Components/ShowValueFields.jsx";
import {EnrolledMembersCard} from "./Components/EnrolledMembersCard.jsx";
import {AddMembers} from "./Components/AddMembers.jsx";

export function Classes() {
  const dispatch = useDispatch();
  // get classes and members from the store
  const classes = useSelector(state => state.dataset.classes);
  const members = useSelector(state => state.dataset.members);

  // to store the new class details
  const [newClass, setNewClass] = useState({name: '', instructor: '', schedule: '', capacity: 0});
  // to store the class being edited (identified by id)
  const [editingClass, setEditingClass] = useState(null);
  // to store the member to be added to a class
  const [memberToAdd, setMemberToAdd] = useState(null);

  // function to add a new class
  const handleAddClass = () => {

    //Basic validation to check if all fields are filled
    if (newClass.name === '' || newClass.instructor === '' || newClass.schedule === '' || newClass.capacity === 0) {
      alert('Please fill all fields');
      return;
    }

    // dispatch the addClass action with the new class details
    dispatch(addClass({...newClass, id: Date.now(), enrolled: []}));
    // reset the newClass state
    setNewClass({name: '', instructor: '', schedule: '', capacity: 0});
  };

  // function to update a class
  const handleUpdateClass = () => {
    // Basic validation to check if all fields are filled
    if (editingClass.name === '' || editingClass.instructor === '' || editingClass.schedule === '' || editingClass.capacity === 0) {
      alert('Please fill all fields');
      return;
    }

    // dispatch the updateClass action with the updated class details
    dispatch(updateClass(editingClass));
    // reset the editingClass state
    setEditingClass(null);
  };

  const handleDeleteClass = (id) => {
    // Confirm before deleting
    if (!window.confirm('Are you sure you want to delete this class?')) {
      return;
    }
    // Just delete the class with the given id
    dispatch(deleteClass(id));
  };

  // function to add a member to a class
  const handleAddMemberToClass = (classId) => {
    // Check if a member is selected
    if (memberToAdd) {
      // Find the class to which the member is to be added
      const updatedClass = classes.find(cls => cls.id === classId);
      // Check if the class is not full, alerts if full
      if (updatedClass.enrolled.length < updatedClass.capacity) {
        // Add the member to the class
        const newEnrolled = [...updatedClass.enrolled, memberToAdd];
        dispatch(updateClass({...updatedClass, enrolled: newEnrolled}));
        // Reset the memberToAdd state
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
      {/* Add New Class Section */}
      <div className="flex flex-col space-y-4 border p-6 shadow-lg rounded-xl">
        <h2 className="text-xl font-bold flex flex-row items-center">
          <GrAdd className="inline-block mr-2"/>
          <p>Add New Class</p>
        </h2>
        <FormInput
          type="text" placeholder="Class Name" value={newClass.name}
          onChange={(e) => setNewClass({...newClass, name: e.target.value})}/>
        <FormInput
          type="text" placeholder="Instructor" value={newClass.instructor}
          onChange={(e) => setNewClass({...newClass, instructor: e.target.value})}/>
        <FormInput
          type="text" placeholder="Schedule" value={newClass.schedule}
          onChange={(e) => setNewClass({...newClass, schedule: e.target.value})}/>
        <div className="flex flex-row items-center justify-between">
          <label htmlFor="capacity">Capacity</label>
          <span>{newClass.capacity}</span>
        </div>
        <FormInput
          type="range" placeholder="Capacity" value={newClass.capacity}
          onChange={(e) => setNewClass({...newClass, capacity: parseInt(e.target.value)})}/>
        <button onClick={handleAddClass} className="bg-blue-500 text-white p-2 rounded">Add Class</button>
      </div>
      {/* Lists all the classes with options to edit, delete and add members */}
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-bold flex flex-row items-center">
          <AiOutlineOrderedList className="inline-block mr-2"/>
          <p>Class List</p>
        </h2>
        {/* Loop through all the classes from the store */}
        {classes.map(cls => (
          <div key={cls.id} className="p-6 rounded-lg flex flex-col space-y-4 bg-gray-800 text-white shadow-xl">
            {/* if the class in editingClass state is the current class, show edit fields, else show value fields */}
            {editingClass && editingClass.id === cls.id
              ? showEditFields(editingClass, setEditingClass, handleUpdateClass)
              : showValueFields(cls, setEditingClass, handleDeleteClass)}
            {/* Add Member Section */}
            <h4 className="text-md font-bold">Add Member</h4>
            {AddMembers(setMemberToAdd, memberToAdd, members, cls, handleAddMemberToClass)}
            {/* Enrolled Members Section */}
            <h4 className="text-md font-bold">Enrolled Members</h4>
            {EnrolledMembersCard(cls, members)}
          </div>
        ))}
      </div>
    </div>
  );
}