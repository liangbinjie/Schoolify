import React from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom"; // Para redirigir al usuario
import projectLogo from "../assets/projectlogo.png"; // Importa el logo

function Navbar() {
  const { logout, isAuthenticated } = useAuth();

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
                  {/* Buscador a la par de "Crear Curso" */}
                  <li className="nav-item">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar..."
                      aria-label="Buscar"
                      style={{ maxWidth: "200px", marginLeft: "15px" }} // Ajusta el tamaño y separación
                    />
                  </li>
                </>
              )}
            </ul>

            {/* Menú desplegable "YO" alineado a la derecha */}
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