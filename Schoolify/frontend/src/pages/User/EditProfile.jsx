import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";

function ProfilePage() {
    const [isPasswordDisabled, setIsPasswordDisabled] = useState(true); // Estado para habilitar/deshabilitar el campo de contraseña
    const { user, updateUser } = useAuth(); // Obtener el usuario del contexto
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        password: "",
        birthDate: user.birthDate,
    });
    const [profilePicture, setProfilePicture] = useState(null); // Estado para la imagen de perfil
    const image = `http://localhost:5000/users/${user.username}/profile-picture`; // URL de la imagen de perfil
    const updateURL = `http://localhost:5000/users/${user._id}` // URL para actualizar el perfil

    // HANDLERS
    const handleTogglePasswordEdit = () => {
      setIsPasswordDisabled(prev => !prev);
      if (isPasswordDisabled) {
        setFormData({ ...formData, password: "" }); // Clear password field when disabling edit
      }
    };
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setProfilePicture(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();

        for (const key in formData) {
            if (key === "password" && (!formData[key] || formData[key].trim() === "")) {
                continue; // Skip appending password if it's empty
            }
            data.append(key, formData[key]);
        }

        // Append file if it exists
        if (profilePicture) {
            data.append("profilePicture", profilePicture); // Debe coincidir con el nombre del campo en el backend
        }

        try {
            const res = await axios.put(updateURL, data, {
              headers: {
                "Content-Type": "multipart/form-data"
              }
            });
            console.log("Success:", res.data);
            updateUser(res.data); // Actualiza el contexto de usuario
            alert("Perfil actualizado con éxito");
            window.location.reload(); // Recargar la página para reflejar los cambios
          } catch (err) {
            console.error("Upload error:", err.response?.data || err.message);
            alert("Error al actualizar el perfil, datos invalidos");
          }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
            <div className="container" style={{ maxWidth: "500px", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                    <div style={{ marginRight: "20px" }}>
                        <img
                            src={image}
                            alt="Foto de perfil"
                            style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }}
                        />
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
                            disabled // Campo deshabilitado
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
                                onChange={handleChange}
                                disabled={isPasswordDisabled}
                                required
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
                            onClick={handleTogglePasswordEdit}>
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
                            accept="image/*" // Acepta solo imágenes
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Guardar Cambios</button>
                </form>
            </div>
        </div>
    );
}

export default ProfilePage;