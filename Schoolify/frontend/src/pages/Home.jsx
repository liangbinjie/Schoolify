import React from 'react';
import projectLogo from '../assets/projectlogo2.png';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthProvider'; // Importa el contexto de autenticación

function Home() {
    const { isAuthenticated } = useAuth(); // Obtén el estado de autenticación

    const containerStyle = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%', // Ocupa toda la altura disponible
        padding: '40px 20px',
        boxSizing: 'border-box', // Asegura que el padding no exceda el tamaño
    };

    const leftContainerStyle = {
        maxWidth: '50%',
        padding: '0 20px',
    };

    const rightContainerStyle = {
        maxWidth: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const imageStyle = {
        width: '40rem',
        borderRadius: '10px',
    };

    const buttonContainerStyle = {
        display: 'flex',
        gap: '20px',
        marginTop: '20px',
    };

    const buttonStyle = {
        padding: '10px 20px',
        fontSize: '1rem',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        width: '30rem', // Botones del mismo ancho que el texto
    };

    const signInButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#007bff',
        color: '#fff',
    };

    const signUpButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#28a745',
        color: '#fff',
    };

    return (
        <Layout>
            <div style={containerStyle}>
                <div style={leftContainerStyle}>
                    <h1>"El aprendizaje es el único tesoro que sigue a su dueño a todas partes."</h1>
                    <p>
                        Schoolify es un sistema diseñado para facilitar la interacción entre docentes y estudiantes. 
                        Los docentes pueden crear cursos personalizados, mientras que los estudiantes tienen la posibilidad de matricularse y acceder a ellos fácilmente.
                        Este proyecto utiliza múltiples bases de datos para garantizar un sistema robusto y eficiente, 
                        explorando tecnologías avanzadas para la gestión de datos en un entorno educativo.
                    </p>
                    {!isAuthenticated && ( // Muestra los botones solo si el usuario no está autenticado
                        <div style={buttonContainerStyle}>
                            <a href="/login" style={{ textDecoration: 'none' }}>
                                <button style={signInButtonStyle}>Iniciar Sesión</button>
                            </a>
                            <a href="/signin" style={{ textDecoration: 'none' }}>
                                <button style={signUpButtonStyle}>Registrarse</button>
                            </a>
                        </div>
                    )}
                </div>
                <div style={rightContainerStyle}>
                    <img
                        src={projectLogo}
                        alt="Imagen representativa del proyecto"
                        style={imageStyle}
                    />
                </div>
            </div>
        </Layout>
    );
}

export default Home;