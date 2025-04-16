import { Routes, Route } from "react-router-dom";
import './App.css'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import LoginPage from './pages/Login.jsx'
import SignInPage from './pages/SignIn.jsx'
import Profile from "./pages/EditProfile.jsx";
import UserProfile from "./pages/UserProfile.jsx"
import WindowPrincipal from './pages/WindowPrincipal.jsx';
import CourseView from "./pages/CourseView.jsx";
import CreateCourse from "./pages/CreateCourse.jsx";
import { AuthRoute, NotAuthRoute } from "./context/AuthRoute.jsx";
// import Footer from './components/Footer.jsx';
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
          <Route element={<NotAuthRoute/>}>
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/signin" element={<SignInPage/>} />
          </Route>
          <Route element={<AuthRoute/>}>
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/userprofile" element={<UserProfile/>}/>
            <Route path="/principal" element={<WindowPrincipal />} />
            <Route path="/course/:id" element={<CourseView />} />
            <Route path="/create-course" element={<CreateCourse />} />
          </Route>
        </Routes>
    </>
    
  )
}

export default App
