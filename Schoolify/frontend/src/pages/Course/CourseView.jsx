import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";

function CourseView() {
    const { id: courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [tabs, setTabs] = useState([]);
    const [filesByTopic, setFilesByTopic] = useState({});
    const [filesBySubtopic, setFilesBySubtopic] = useState({});
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [activeTab, setActiveTab] = useState("temas");
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/courses/${courseId}`);
                setCourse(response.data);
                if (response.data.studentList.includes(user.username)) {
                    setIsEnrolled(true);
                }
            } catch (error) {
                console.error("Error fetching course details:", error);
            }
        };

        const fetchTabs = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/tabs/courses/${courseId}/tabs`);
                setTabs(response.data);
            } catch (error) {
                console.error("Error fetching course tabs:", error);
            }
        };

        fetchCourse();
        fetchTabs();
    }, [courseId, user.username]);

    const fetchFilesByTopic = async (topicId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/files/list/topic/${courseId}/${topicId}`);
            setFilesByTopic((prev) => ({
                ...prev,
                [topicId]: response.data,
            }));
        } catch (error) {
            console.error("Error fetching files for topic:", error);
        }
    };

    const fetchFilesBySubtopic = async (topicId, subtopicId) => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/files/list/subtopic/${courseId}/${topicId}/${subtopicId}`
            );
            setFilesBySubtopic((prev) => ({
                ...prev,
                [subtopicId]: response.data,
            }));
        } catch (error) {
            console.error("Error fetching files for subtopic:", error);
        }
    };

    const downloadFile = async (fileId, filename) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/files/download/${fileId}`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    const renderFiles = (files) => (
        <ul className="list-group mt-2">
            {files.map((file) => (
                <li key={file.file_id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{file.filename}</span>
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => downloadFile(file.file_id, file.filename)}
                    >
                        Descargar
                    </button>
                </li>
            ))}
        </ul>
    );

    const renderSubtabs = (subtabs, topicId) => (
        <div className="accordion mt-2" id={`subtabs-${topicId}`}>
            {subtabs.map((subtab, index) => (
                <div className="accordion-item" key={subtab._id}>
                    <h2 className="accordion-header" id={`subtab-heading-${subtab._id}`}>
                        <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#subtab-collapse-${subtab._id}`}
                            aria-expanded="false"
                            aria-controls={`subtab-collapse-${subtab._id}`}
                            onClick={() => fetchFilesBySubtopic(topicId, subtab._id)}
                        >
                            {subtab.title}
                        </button>
                    </h2>
                    <div
                        id={`subtab-collapse-${subtab._id}`}
                        className="accordion-collapse collapse"
                        aria-labelledby={`subtab-heading-${subtab._id}`}
                        data-bs-parent={`#subtabs-${topicId}`}
                    >
                        <div className="accordion-body">
                            <p>{subtab.description}</p>
                            {isEnrolled && filesBySubtopic[subtab._id] && renderFiles(filesBySubtopic[subtab._id])}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="container my-5">
            {course ? (
                <>
                    <div className="d-flex align-items-center justify-content-center mb-4">
                        {course.image ? (
                            <img
                                src={`http://localhost:5000/courses/${courseId}/image`}
                                alt={`${course.name} logo`}
                                className="img-fluid me-4"
                                style={{
                                    maxHeight: "200px",
                                    maxWidth: "200px",
                                    objectFit: "contain",
                                    borderRadius: "10px",
                                }}
                            />
                        ) : (
                            <p>No hay logo disponible.</p>
                        )}
                        <div>
                            <h1 className="display-4 fw-bold">{course.name}</h1>
                            <p className="text-muted fs-3">
                                <strong>Profesor:</strong>{" "}
                                <a href={`http://localhost:5173/users/${course.teacher}`}>{course.teacher}</a>
                            </p>
                            <p className="text-muted fs-4">
                                <strong>Estado:</strong> {course.state}
                            </p>
                        </div>
                    </div>

                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === "temas" ? "active" : ""}`}
                                onClick={() => setActiveTab("temas")}
                            >
                                Temas del Curso
                            </button>
                        </li>
                    </ul>

                    {activeTab === "temas" && (
                        <div className="card mt-4">
                            <div className="card-body">
                                <h5 className="card-title">Temas del Curso</h5>
                                <div className="accordion" id="courseTabsAccordion">
                                    {tabs.map((tab, index) => (
                                        <div className="accordion-item" key={tab._id}>
                                            <h2 className="accordion-header" id={`heading-${index}`}>
                                                <button
                                                    className="accordion-button"
                                                    type="button"
                                                    data-bs-toggle="collapse"
                                                    data-bs-target={`#collapse-${index}`}
                                                    aria-expanded="false"
                                                    aria-controls={`collapse-${index}`}
                                                    onClick={() => fetchFilesByTopic(tab._id)}
                                                >
                                                    {tab.title}
                                                </button>
                                            </h2>
                                            <div
                                                id={`collapse-${index}`}
                                                className="accordion-collapse collapse"
                                                aria-labelledby={`heading-${index}`}
                                                data-bs-parent="#courseTabsAccordion"
                                            >
                                                <div className="accordion-body">
                                                    {isEnrolled && filesByTopic[tab._id] && renderFiles(filesByTopic[tab._id])}
                                                    {tab.subtabs && renderSubtabs(tab.subtabs, tab._id)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-center">Cargando información del curso...</p>
            )}
        </div>
    );
}

export default CourseView;
