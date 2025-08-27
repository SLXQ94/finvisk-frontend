import { create } from 'zustand';

const usePaymentStore = create((set) => ({
  paymentHTML: null,
  setPaymentHTML: (html) => set({ paymentHTML: html }),
  clearPaymentHTML: () => set({ paymentHTML: null }),
}));

export default usePaymentStore;