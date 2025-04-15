import { Routes, Route } from "react-router-dom";
import './App.css'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import LoginPage from './pages/Login.jsx'
import SignInPage from './pages/SignIn.jsx'
import Profile from "./pages/MyProfile.jsx";
import UserProfile from "./pages/UserProfile.jsx"
import WindowPrincipal from './pages/WindowPrincipal.jsx';
/* 

Se define todo lo relacionado a rutas,
Se define el "navbar" como un componente global en toda la app
--> Agregar en un futuro rutas autorizadas y no autorizadas (es decir, si el usuario no esta logueado no podra ingresar a ciertas rutas)

*/

function App() {
  return (
    <>
      <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/home" element={<Home/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/signin" element={<SignInPage/>} />
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/userprofile" element={<UserProfile/>}/>
          <Route path="/principal" element={<WindowPrincipal />} />
        </Routes>
    </>
  )
}

export default App
