import React from 'react';
import Footer from './Footer';

function Layout({ children }) {
    const layoutStyle = {
        display: 'flex',
        flexDirection: 'column',
        height: '100%', // Ocupa toda la altura disponible
    };

    const contentStyle = {
        flex: 1, // El contenido ocupa el espacio restante entre el Navbar y el Footer
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Evita el scroll dentro del contenido
    };

    return (
        <div style={layoutStyle}>
            <main style={contentStyle}>{children}</main>
            <Footer />
        </div>
    );
}

export default Layout;