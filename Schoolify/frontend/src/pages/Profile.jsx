import React, { useState } from "react";

function ProfilePage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "", // Contraseña oculta
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

        // Convertir la fecha a formato mm/dd/aaaa
        const formattedDate = new Date(formData.birthDate).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        });

        const dataToSubmit = { ...formData, birthDate: formattedDate };

        // Aquí enviarías los datos al backend para procesarlos
        console.log("Datos enviados:", dataToSubmit);
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <div className="container" style={{ maxWidth: "500px", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                    <div style={{ marginRight: "20px" }}>
                        {formData.avatar ? (
                            <img
                                src={URL.createObjectURL(formData.avatar)}
                                alt="Foto de perfil"
                                style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    borderRadius: "50%",
                                    backgroundColor: "#ddd",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "14px",
                                    color: "#555",
                                }}
                            >
                                Sin Foto
                            </div>
                        )}
                    </div>
                    <h1>Perfil de Usuario</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="firstName" className="form-label">Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="lastName" className="form-label">Apellido</label>
                        <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            disabled // Campo deshabilitado
                        />
                    </div>
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
                    <div className="mb-3" style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                value={formData.password}
                                disabled // Campo deshabilitado
                            />
                        </div>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            style={{
                                marginLeft: "10px", // Espaciado entre el input y el botón
                                height: "calc(2.25rem + 2px)", // Altura igual al input (Bootstrap)
                                alignSelf: "flex-end", // Alineación vertical
                            }}
                            onClick={() => console.log("Cambiar contraseña")}
                        >
                            Cambiar
                        </button>
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
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Guardar Cambios</button>
                </form>
            </div>
        </div>
    );
}

export default ProfilePage;