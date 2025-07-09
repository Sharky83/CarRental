import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function DisabledDatesPicker({ value, onChange, carId, axios, label, minDate }) {
  const [unavailableRanges, setUnavailableRanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUnavailable() {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/public-bookings/car/${carId}`);
        if (data.success) {
          setUnavailableRanges(
            data.bookings.map(b => [new Date(b.pickupDate), new Date(b.returnDate)])
          );
        }
      } catch (e) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    }
    if (carId) fetchUnavailable();
  }, [carId, axios]);

  // Disable all dates in any booked range
  function isDateDisabled(date) {
    return unavailableRanges.some(([start, end]) => date >= start && date <= end);
  }

  return (
    <div className="flex flex-col gap-2">
      <label>{label}</label>
      <DatePicker
        selected={value ? new Date(value) : null}
        onChange={date => onChange(date ? date.toISOString().split('T')[0] : '')}
        minDate={minDate}
        filterDate={date => !isDateDisabled(date)}
        placeholderText={loading ? 'Loading...' : 'Select a date'}
        className="border border-borderColor px-3 py-2 rounded-lg"
        dateFormat="yyyy-MM-dd"
        disabled={loading}
      />
    </div>
  );
}
