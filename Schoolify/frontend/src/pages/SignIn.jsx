import React, { useState } from "react";

function SignInPage() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        fullName: "",
        birthDate: "",
        avatar: null,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, avatar: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Aquí enviarías los datos al backend para procesarlos
        console.log("Datos enviados:", formData);
    };

    return (
        <>
            <div className="container m-5">
                <h1>Registro de Usuario</h1>
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
                    <div className="mb-3">
                        <label htmlFor="fullName" className="form-label">Nombre Completo</label>
                        <input
                            type="text"
                            className="form-control"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="birthDate" className="form-label">Fecha de Nacimiento</label>
                        <input
                            type="date"
                            className="form-control"
                            id="birthDate"
                            name="birthDate"
                            value={formData.birthDate}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="avatar" className="form-label">Foto o Avatar</label>
                        <input
                            type="file"
                            className="form-control"
                            id="avatar"
                            name="avatar"
                            onChange={handleFileChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Registrarse</button>
                </form>
            </div>
        </>
    );
}

export default SignInPage;