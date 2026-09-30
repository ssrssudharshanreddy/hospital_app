import React from 'react';
import Select from '../common/Select';

export default function DoctorSelector({
  doctors = [],
  selectedDoctorId,
  onChange,
  label = 'Attending Doctor',
  required = false,
  error,
  helperText,
  disabled = false,
  style = {}
}) {
  const options = doctors.map((doc) => ({
    value: doc.doctorId,
    label: `${doc.doctorName} — ${doc.specialization} (Room ${doc.roomNo})`,
  }));

  return (
    <Select
      label={label}
      name="doctorId"
      value={selectedDoctorId || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      options={options}
      placeholder="Select an attending doctor..."
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      style={style}
    />
  );
}
