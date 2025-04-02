import {createRoot} from 'react-dom/client'
import './index.css'
import App from './pages/App.tsx'
import {BrowserRouter, Route, Routes} from "react-router";
import NavMenu from "@/pages/shared/NavMenu.tsx";
import Upload from "@/pages/Upload.tsx";
import Login from "@/pages/Login.tsx";

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <NavMenu/>
    <Routes>
      <Route path="/" element={<App/>}/>
      <Route path="/upload" element={<Upload/>}/>
      <Route path="/login" element={<Login/>}/>
    </Routes>
  </BrowserRouter>,
)
