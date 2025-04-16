import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CreateCourse() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        teacher: "",
    });

    const [courseImage, setCourseImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCourseImage(file);
            // Create a preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const data = new FormData();

        // Append all form data
        for (const key in formData) {
            data.append(key, formData[key]);
        }

        // Append image file if exists
        if (courseImage) {
            data.append("image", courseImage);
        }

        try {
            const res = await axios.post("http://localhost:5000/courses", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            
            console.log("Curso creado exitosamente:", res.data);
            // Redirect to course view or course list
            navigate(`/course/${res.data.course._id}`);
        } catch (err) {
            console.error("Error al crear curso:", err);
            setError(err.response?.data?.message || "Error al crear el curso. Por favor, inténtelo de nuevo.");
        }
    };

    return (
        <div className="container my-5">
            <h1 className="mb-4">Crear Nuevo Curso</h1>
            
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-8">
                        <div className="mb-3">
                            <label htmlFor="code" className="form-label">Código del Curso*</label>
                            <input
                                type="text"
                                className="form-control"
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Nombre del Curso*</label>
                            <input
                                type="text"
                                className="form-control"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">Descripción*</label>
                            <textarea
                                className="form-control"
                                id="description"
                                name="description"
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>
                        
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="startDate" className="form-label">Fecha de Inicio*</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className="col-md-6 mb-3">
                                <label htmlFor="endDate" className="form-label">Fecha de Finalización*</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="mb-3">
                            <label htmlFor="teacher" className="form-label">Nombre del Profesor*</label>
                            <input
                                type="text"
                                className="form-control"
                                id="teacher"
                                name="teacher"
                                value={formData.teacher}
                                onChange={handleChange}
                                required
                            />
                            <small className="text-muted">Ingrese el nombre del profesor</small>
                        </div>
                    </div>
                    
                    <div className="col-md-4">
                        <div className="mb-3">
                            <label htmlFor="image" className="form-label">Imagen del Curso</label>
                            <input
                                type="file"
                                className="form-control"
                                id="image"
                                name="image"
                                accept="image/jpeg, image/png"
                                onChange={handleFileChange}
                            />
                            <small className="text-muted">Formatos aceptados: JPEG, PNG</small>
                        </div>
                        
                        {imagePreview && (
                            <div className="mb-3">
                                <label className="form-label">Vista Previa</label>
                                <div className="border rounded p-2">
                                    <img 
                                        src={imagePreview} 
                                        alt="Vista previa del curso" 
                                        className="img-fluid rounded"
                                        style={{ maxHeight: "200px" }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="mt-4">
                    <button type="submit" className="btn btn-primary me-2">Crear Curso</button>
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateCourse;