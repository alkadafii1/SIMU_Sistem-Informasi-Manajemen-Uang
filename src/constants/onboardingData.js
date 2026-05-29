export const STEP_ONE_FEATURES = [
  { icon: 'edit_note', text: 'Catat pemasukan & pengeluaran cepat' },
  { icon: 'calculate', text: 'Rekomendasi budget harian berbasis AI' },
  { icon: 'lock', text: 'Analisis aman dengan enkripsi' },
];

export const STEP_TWO_ALLOCATIONS = [
  { 
    icon: 'shopping_cart', 
    name: 'Kebutuhan Utama', 
    description: 'Cicilan, Tagihan, Makanan & Transportasi', 
    percentage: 50, 
    color: '#006D77', 
    bgColor: 'bg-[#006D77]/10' 
  },
  { 
    icon: 'celebration', 
    name: 'Keinginan & Hobi', 
    description: 'Jajan, Konser, & Self-reward', 
    percentage: 30, 
    color: '#2A9D8F', 
    bgColor: 'bg-[#2A9D8F]/10' 
  },
  { 
    icon: 'savings', 
    name: 'Tabungan & Investasi', 
    description: 'Dana darurat, Saham, & Masa depan', 
    percentage: 20, 
    color: '#80CED7', 
    bgColor: 'bg-[#80CED7]/10' 
  },
];

export const STEP_TWO_SIMULATION = [
  { label: 'Kebutuhan', value: 'Rp 2.500.000', color: 'bg-[#006D77]', width: 'w-1/2' },
  { label: 'Keinginan', value: 'Rp 1.500.000', color: 'bg-[#2A9D8F]', width: 'w-[30%]' },
  { label: 'Tabungan', value: 'Rp 1.000.000', color: 'bg-[#80CED7]', width: 'w-1/5' },
];

export const STEP_THREE_FEATURES = [
  { icon: 'today', title: 'Smart Daily Budget', description: 'Batas belanja harianmu dikalkulasi otomatis setiap pagi.' },
  { icon: 'robot_2', title: 'AI Financial Advisor', description: 'Dapatkan insight personal tentang kebiasaan keuanganmu.' },
  { icon: 'target', title: 'Dream Tracker', description: 'Visualisasikan target tabungan untuk barang impianmu.' },
];

export const STEP_THREE_TRANSACTIONS = [
  { icon: 'local_cafe', label: 'Kopi Susu', amount: '-Rp 28.000', category: 'Keinginan', isExpense: true },
  { icon: 'directions_car', label: 'Transportasi', amount: '-Rp 45.000', category: 'Kebutuhan', isExpense: true },
  { icon: 'payments', label: 'Gaji Bulanan', amount: '+Rp 5.000.000', category: 'Pemasukan', isExpense: false },
];