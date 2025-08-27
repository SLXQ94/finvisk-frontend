// import moment from 'moment';
// import { useState } from 'react';
// import { API_URL } from '../constants/api';
// import { useAuthStore } from '../store/authStore';

// export const useInvestmentModal = ({ onClose, bseCode, schemePlanId }) => {
//   const { token } = useAuthStore();

//   const [selectedType, setSelectedType] = useState(null);
//   const [amount, setAmount] = useState('');
//   const [sipStartDate, setSipStartDate] = useState('');
//   const [sipNumInst, setSipNumInst] = useState('');
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const handleDateChange = (event, selectedDate) => {
//     setShowDatePicker(false);
//     if (selectedDate) {
//       const formattedDate = moment(selectedDate).format('DD/MM/YYYY');
//       setSipStartDate(formattedDate);
//     }
//   };

//   const handleLumpsumOrder = async () => {
//     if (!amount) {
//       alert('Please enter an amount');
//       return;
//     }

//     try {
//       const res = await fetch(`${API_URL}/v1/provider/lumpsum-order`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           amount,
//           bse_code: bseCode || 'MOLFGP-GR' // use passed prop
//         })
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Lumpsum failed');

//       alert('Success: Lumpsum order initiated');
//       onClose();
//     } catch (err) {
//       alert('Error: ' + err.message);
//     }
//   };

//   const handleSipOrder = async () => {
//     if (!amount || !sipStartDate || !sipNumInst) {
//       alert('Please fill all SIP fields');
//       return;
//     }

//     try {
//       const res = await fetch(`${API_URL}/v1/provider/sip-order`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           amount,
//           schemePlanId,
//           sip_start_date: sipStartDate,
//           sip_num_inst: sipNumInst
//         })
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'SIP failed');

//       alert('Success: SIP order placed');
//       onClose();
//     } catch (err) {
//       alert('Error: ' + err.message);
//     }
//   };

//   return {
//     // State
//     selectedType,
//     setSelectedType,
//     amount,
//     setAmount,
//     sipStartDate,
//     sipNumInst,
//     setSipNumInst,
//     showDatePicker,
//     setShowDatePicker,

//     // Handlers
//     handleLumpsumOrder,
//     handleSipOrder,
//     handleDateChange
//   };
// };