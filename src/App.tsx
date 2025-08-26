// App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ROUTES from "./routes";
import Dashboard from "./pages/Dashboard";
import Categorias from "./pages/Categorias";
import Bebidas from "./pages/Bebidas";
import Mesas from "./pages/Mesas";
import Promociones from "./pages/Promociones"; // ← nuevo
import Spotify from "./pages/Spotify"
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.dashboard} element={<Dashboard />} />
        <Route path={ROUTES.categorias} element={<Categorias />} />
        <Route path={ROUTES.bebidas} element={<Bebidas />} />
        <Route path={ROUTES.mesas} element={<Mesas />} />
        <Route path={ROUTES.promociones} element={<Promociones />} />
        <Route path={ROUTES.spotify} element={<Spotify />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
