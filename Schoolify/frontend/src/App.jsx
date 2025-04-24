import { Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import LoginPage from './pages/Auth/Login.jsx'
import SignInPage from './pages/Auth/SignIn.jsx'
import Profile from "./pages/User/EditProfile.jsx";
import UserProfile from "./pages/User/UserProfile.jsx"
import WindowPrincipal from './pages/WindowPrincipal.jsx';
import CourseView from "./pages/Course/CourseView.jsx";
import CreateCourse from "./pages/Course/CreateCourse.jsx";
import FriendRequests from "./pages/User/FriendRequets.jsx";
import Friends from "./pages/User/Friends.jsx";
import Messages from "./pages/User/Messages.jsx";
import UserCourses from "./pages/User/UserCourses.jsx";
import EditCourse from "./pages/User/EditCourse.jsx";
import EnrolledCourses from "./pages/Course/EnrolledCourses.jsx";
import CourseEvaluation from "./pages/Course/CourseEvaluation.jsx";
import { AuthRoute, NotAuthRoute } from "./context/AuthRoute.jsx";
import { useAuth } from "./context/AuthProvider";
import { ThemeProvider } from './context/ThemeProvider';

function App() {
    const { user } = useAuth(); // Obtén el usuario autenticado
    return (
        <ThemeProvider>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route element={<NotAuthRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signin" element={<SignInPage />} />
                </Route>
                <Route element={<AuthRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/friend-requests" element={<FriendRequests />} />
                    <Route path="/users/:username" element={<UserProfile />} />
                    <Route path="/principal" element={<WindowPrincipal />} />
                    <Route path="/course/:id" element={<CourseView />} />
                    <Route path="/create-course" element={<CreateCourse />} />
                    <Route path="/amigos" element={<Friends />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/cursos-matriculados" element={<EnrolledCourses/>} />
                    {user ? (
                        <Route path="/cursos-creados" element={<UserCourses userId={user._id} />} />
                    ) : (
                        <Route path="/cursos-creados" element={<Navigate to="/login" />} />
                    )}
                    <Route path="/edit-course/:courseId" element={<EditCourse />} />
                    <Route path="/course/:courseId/evaluations/:evaluationId" element={<CourseEvaluation />} />
                </Route>
            </Routes>
        </ThemeProvider>
    );
}

export default App;
