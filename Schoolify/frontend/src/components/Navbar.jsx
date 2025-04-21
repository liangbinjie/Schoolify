import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom"; // Para redirigir al usuario
import projectLogo from "../assets/projectlogo.png"; // Importa el logo
import SearchResults from "./SearchResults";

function Navbar() {
  const { logout, isAuthenticated } = useAuth();

  // Estado para la funcionalidad de búsqueda
  const [searchQuery, setSearchQuery] = useState(''); // Texto actual de búsqueda
  const [searchType, setSearchType] = useState('courses'); // Tipo de búsqueda (cursos/usuarios)
  const [searchResults, setSearchResults] = useState([]); // Resultados de la API
  const [showResults, setShowResults] = useState(false); // Controla la visibilidad del menú de resultados

  // Efecto de búsqueda con debounce - se activa 300ms después de que el usuario deja de escribir
  useEffect(() => {
    const search = async () => {
      // No buscar si la consulta es muy corta
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        // Obtener resultados del endpoint correspondiente
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/${searchType}/search/${searchQuery}`
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error en la búsqueda:', error);
        setSearchResults([]);
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
                  <li className="nav-item" style={{ position: 'relative' }}>
                    {/* Selector de tipo de búsqueda */}
                    <select
                      className="form-select me-2"
                      value={searchType}
                      onChange={handleSearchTypeChange}
                      style={{ width: 'auto', display: 'inline-block' }}
                    >
                      <option value="courses">Cursos</option>
                      <option value="users">Usuarios</option>
                    </select>
                    {/* Input de búsqueda */}
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Buscar ${searchType === 'courses' ? 'cursos' : 'usuarios'}...`}
                      value={searchQuery}
                      onChange={handleSearchChange}
                      style={{ width: '200px', display: 'inline-block' }}
                    />
                    {/* Menú desplegable de resultados */}
                    {showResults && searchQuery.length >= 2 && (
                      <SearchResults
                        results={searchResults}
                        type={searchType}
                        onClose={() => setShowResults(false)}
                      />
                    )}
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
                  <button className="btn btn-info">Sign In</button>
                </a>
                <a href="/signin">
                  <button className="btn btn-outline-success ms-2">Sign Up</button>
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