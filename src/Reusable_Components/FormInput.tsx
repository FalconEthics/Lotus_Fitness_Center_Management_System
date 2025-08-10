import { FormInputProps } from '../types';

export const FormInput = ({ type, placeholder, value, onChange, options }: FormInputProps): JSX.Element => {
  // This function exists so that all forms have a consistent look and feel (css repetition purposes mainly)
  switch (type) {
    case 'select':
      return (
        <select
          className="border p-2 rounded"
          value={value}
          onChange={onChange}
        >
          <option value="" disabled>Select Membership Type</option>
          {options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    case 'date':
      return (
        <input
          type="date"
          placeholder={placeholder}
          value={value as string}
          className="border p-2 rounded"
          onChange={onChange}
        />
      );
    case 'range':
      return (
        <input
          type="range"
          placeholder={placeholder}
          value={value}
          className="border p-2 rounded"
          min={0}
          max={100}
          onChange={onChange}
        />
      );
    default:
      return (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          className="border p-2 rounded"
          onChange={onChange}
        />
      );
  }
};