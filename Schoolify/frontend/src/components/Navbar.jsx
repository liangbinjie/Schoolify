import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom"; // Para redirigir al usuario
import projectLogo from "../assets/projectlogo.png"; // Importa el logo
import SearchResults from "./SearchResults";

function Navbar() {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);

  // Estados para la funcionalidad de búsqueda
  const [searchQuery, setSearchQuery] = useState(''); // Texto actual de búsqueda
  const [searchType, setSearchType] = useState('courses'); // Tipo de búsqueda (cursos/usuarios)
  const [searchResults, setSearchResults] = useState([]); // Resultados de la API
  const [showResults, setShowResults] = useState(false); // Controla la visibilidad del menú de resultados
  const [isLoading, setIsLoading] = useState(false); // Estado de carga de la búsqueda

  // Cierra los resultados cuando se hace clic fuera del área de búsqueda
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Efecto de búsqueda con debounce - se activa 300ms después de que el usuario deja de escribir
  useEffect(() => {
    const search = async () => {
      // No buscar si la consulta es muy corta
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Obtener resultados del endpoint correspondiente
        const url = `${process.env.REACT_APP_API_URL}/api/${searchType}/search/${searchQuery}`;
        console.log('Search URL:', url);
        const response = await fetch(url);
        console.log('Search Response:', response);
        const data = await response.json();
        console.log('Search Data:', data);
        setSearchResults(data);
      } catch (error) {
        console.error('Error en la búsqueda:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce para prevenir demasiadas llamadas a la API
    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchType]);

  // Maneja cambios en el input de búsqueda
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  // Maneja cambios en el tipo de búsqueda (cursos/usuarios)
  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSearchResults([]);
  };

  // Maneja la selección de un resultado
  const handleResultSelect = (result) => {
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          {/* Logo del proyecto */}
          <a className="navbar-brand d-flex align-items-center" href="/">
            <img
              src={projectLogo}
              alt="Schoolify Logo"
              style={{ height: "50px", marginRight: "10px" }} // Ajusta el tamaño del logo
            />
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" aria-current="page" href="/home">
                  Home
                </a>
              </li>

              {isAuthenticated && (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/principal">
                      Explorar
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/amigos">
                      Amigos
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/messages">
                      Mensajes
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/create-course">
                      Crear Curso
                    </a>
                  </li>
                  {/* Funcionalidad de búsqueda */}
                  <li className="nav-item" style={{ position: 'relative' }} ref={searchContainerRef}>
                    <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                      <select
                        className="form-select"
                        value={searchType}
                        onChange={handleSearchTypeChange}
                        style={{ width: 'auto' }}
                      >
                        <option value="courses">Cursos</option>
                        <option value="users">Usuarios</option>
                      </select>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={`Buscar ${searchType === 'courses' ? 'cursos' : 'usuarios'}...`}
                          value={searchQuery}
                          onChange={handleSearchChange}
                          onFocus={() => setShowResults(true)}
                          style={{ width: '100%' }}
                        />
                        {isLoading && (
                          <div className="position-absolute" style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </div>
                          </div>
                        )}
                        {showResults && searchQuery.length >= 2 && (
                          <SearchResults
                            results={searchResults}
                            type={searchType}
                            onClose={() => setShowResults(false)}
                            onSelect={handleResultSelect}
                          />
                        )}
                      </div>
                    </div>
                  </li>
                </>
              )}
            </ul>

            {/* Menú desplegable de usuario */}
            {isAuthenticated && (
              <>
                <div className="dropdown ms-auto">
                  <button
                    className="btn btn-secondary dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    YO
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <li>
                      <a className="dropdown-item" href="/profile">
                        Editar Información
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="/friend-requests">
                        Solicitudes de Amistad
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="/cursos-creados">
                        Cursos Creados
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="/cursos-matriculados">
                        Cursos Matriculados
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="/" onClick={logout}>
                        Cerrar Sesión
                      </a>
                    </li>
                  </ul>
                </div>
              </>
            )}
            {!isAuthenticated && (
              <>
                <a href="/login">
                  <button className="btn btn-info">Iniciar Sesión</button>
                </a>
                <a href="/signin">
                  <button className="btn btn-outline-success ms-2">Registrarse</button>
                </a>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;