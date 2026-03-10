import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { Cropper } from '@/pages/Cropper';
import { PrintLayout } from '@/pages/PrintLayout';
import { GaussianBg } from '@/pages/GaussianBg';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cropper" element={<Cropper />} />
        <Route path="/print" element={<PrintLayout />} />
        <Route path="/gaussian" element={<GaussianBg />} />
      </Routes>
    </BrowserRouter>
  );
}
