import React from "react";
import { useLocation } from "react-router-dom"; // Para detectar la ruta actual

function Navbar() {
  const location = useLocation(); // Obtiene la ruta actual
  const isOnPrincipal = location.pathname === "/principal"; // Verifica si está en WindowPrincipal

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            SCHOOLIFY
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

              {isOnPrincipal && (
                <>
                  <li className="nav-item">
                    <a className="nav-link" href="/explorar">
                      Explorar
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/amigos">
                      Amigos
                    </a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/crear-curso">
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
=======
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Link
                </a>
              </li>
            </ul>

            {/* Menú desplegable "YO" alineado a la derecha */}
            {isOnPrincipal && (
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
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                  <li>
                    <a className="dropdown-item" href="/editar-informacion">
                      Editar Información
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
                    <a className="dropdown-item" href="/cerrar-sesion">
                      Cerrar Sesión
                    </a>
                  </li>
                </ul>
              </div>
            )}
            {!isOnPrincipal && (
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