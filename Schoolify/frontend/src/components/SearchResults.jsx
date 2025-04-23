import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchResults = ({ results, type, onClose, onSelect }) => {
    const navigate = useNavigate();
    const resultsRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(-1);

    // Maneja la navegación con teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                handleResultClick(results[selectedIndex]);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [results, selectedIndex]);

    // Desplaza el elemento seleccionado a la vista
    useEffect(() => {
        if (selectedIndex >= 0 && resultsRef.current) {
            const selectedElement = resultsRef.current.children[selectedIndex];
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    // Maneja el clic en un resultado
    const handleResultClick = (result) => {
        if (type === 'users') {
            navigate(`/users/${result.username}`);
        } else {
            navigate(`/course/${result._id}`);
        }
        onClose();
        if (onSelect) onSelect(result);
    };

    return (
        <div
            ref={resultsRef}
            className="search-results"
            style={{
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
            }}
        >
            {results.length === 0 ? (
                <div className="p-2 text-muted">No se encontraron resultados</div>
            ) : (
                results.map((result, index) => (
                    <div
                        key={result._id}
                        className={`p-2 border-bottom ${index === selectedIndex ? 'bg-light' : ''}`}
                        style={{
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                        onClick={() => handleResultClick(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                    >
                        {type === 'users' ? (
                            <>
                                <div className="avatar-circle bg-primary text-white">
                                    {result.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <strong>{result.username}</strong>
                                    <div className="text-muted">
                                        {result.firstName} {result.lastName}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="avatar-circle bg-success text-white">
                                    {result.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <strong>{result.name}</strong>
                                    <div className="text-muted">
                                        {result.code} - {result.teacher}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default SearchResults; 