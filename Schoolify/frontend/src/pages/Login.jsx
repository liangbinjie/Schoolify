import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate
import axios from "axios";

function LoginPage() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const navigate = useNavigate(); // Inicializa el hook useNavigate

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí poner para verificar el usuario en la base de datos
        console.log("Intento de inicio de sesión:", formData);

        axios
            .post("http://localhost:5000/login", {
            emailOrUsername: formData.username,
            password: formData.password})
            .then((response) => {
                console.log("Inicio de sesión exitoso:", response.data);
                // Se le redirige a la pagina principal
                navigate("/principal");
            })
            .catch((error) => {
                console.error("Error al iniciar sesión:", error);
                alert("Error al iniciar sesión. Verifica tus credenciales.");
            }
            )
    };

    const handleSignUpRedirect = () => {
        navigate("/signin"); // Redirige a la página de registro
    };

    const handleGoToPrincipal = () => {
        navigate("/principal"); // Redirige a la página WindowPrincipal sin autenticación
    };

    return (
        <>
            <div className="container m-5">
                <h1>Inicio de sesión</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Nombre de Usuario</label>
                        <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Iniciar Sesión</button>
                    <button
                        type="button"
                        className="btn btn-link mt-3"
                        onClick={handleSignUpRedirect}
                    >
                        No tengo usuario
                    </button>
                  
                </form>
            </div>
        </>
    );
}

export default LoginPage;