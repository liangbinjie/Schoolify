import React from 'react';
import { useNavigate } from 'react-router-dom';


const SearchResults = ({ results, type, onClose }) => {
    const navigate = useNavigate();

    // Maneja el clic en un resultado de búsqueda
    // Navega al perfil o curso correspondiente
    const handleResultClick = (result) => {
        if (type === 'users') {
            navigate(`/profile/${result.username}`);
        } else {
            navigate(`/course/${result._id}`);
        }
        onClose();
    };

    return (
        // Contenedor estilizado para los resultados de búsqueda
        <div className="search-results" style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto'
        }}>
            {/* Muestra mensaje "No hay resultados" si la búsqueda está vacía */}
            {results.length === 0 ? (
                <div className="p-2 text-muted">No se encontraron resultados</div>
            ) : (
                // Mapea los resultados y muestra cada elemento
                results.map((result) => (
                    <div
                        key={result._id}
                        className="p-2 border-bottom"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleResultClick(result)}
                    >
                        {/* Muestra información de usuario si se busca usuarios */}
                        {type === 'users' ? (
                            <div>
                                <strong>{result.username}</strong>
                                <div className="text-muted">
                                    {result.firstName} {result.lastName}
                                </div>
                            </div>
                        ) : (
                            // Muestra información del curso si se busca cursos
                            <div>
                                <strong>{result.name}</strong>
                                <div className="text-muted">
                                    {result.code} - {result.teacher}
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default SearchResults; 