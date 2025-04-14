function Home() {
    return (
        <>
            <div className="container m-5 text-center">
               
                <h1 className="display-4 fw-bold mb-4">
                    "El aprendizaje es el único tesoro que sigue a su dueño a todas partes."
                </h1>

                <img
                    src="/logo.svg"
                    alt="Logo de Schoolify"
                    className="mb-4"
                    style={{ maxWidth: "200px" }}
                    />
                <div className="d-flex justify-content-center gap-4">
                    <a href="/login" className="btn btn-primary btn-lg">
                        Sign In
                    </a>
                    <a href="/signin" className="btn btn-success btn-lg">
                        Sign Up
                    </a>
                </div>
            </div>

            {/* Pie de página */}
            <footer className="text-center mt-5">
                <p>Realizado por:</p>
                <ul className="list-unstyled">
                    <li>1- Nombre 1</li>
                    <li>2- Nombre 2</li>
                    <li>3- Nombre 3</li>
                    <li>4- Nombre 4</li>
                    <li>5- Nombre 5</li>
                    <li>6- Nombre 6</li>
                </ul>
            </footer>
        </>
    );
}

export default Home;