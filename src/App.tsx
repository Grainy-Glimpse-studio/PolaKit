import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { Cropper } from '@/pages/Cropper';
import { PrintLayout } from '@/pages/PrintLayout';
import { GaussianBg } from '@/pages/GaussianBg';
import { QuickProcess } from '@/pages/QuickProcess';
import { Prototype } from '@/pages/Prototype';
import { About } from '@/pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cropper" element={<Cropper />} />
        <Route path="/print" element={<PrintLayout />} />
        <Route path="/gaussian" element={<GaussianBg />} />
        <Route path="/quick" element={<QuickProcess />} />
        <Route path="/prototype" element={<Prototype />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
