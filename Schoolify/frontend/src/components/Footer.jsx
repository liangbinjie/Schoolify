import React from 'react';

function Footer() {
    const footerStyle = {
      backgroundColor: '#f8f9fa',
      padding: '10px 20px',
      textAlign: 'center',
      borderTop: '1px solid #ddd',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      flexWrap: 'wrap',
      height: 'auto',
      position: 'absolute',
      bottom: 0,
      width: '100%',
    };
  
    const listItemStyle = {
      margin: '0 15px',
      lineHeight: '1.4',
      textAlign: 'left',
    };
  
    const nameStyle = {
      fontWeight: 'bold',
      fontSize: '14px',
    };
  return (
    <footer style={footerStyle}>
      <div style={listItemStyle}>
        <span style={nameStyle}>Armando García Paniagua</span><br />
        2020065209<br />
        armandgp07@estudiantec.cr
      </div>
      <div style={listItemStyle}>
        <span style={nameStyle}>Mariano Mayorga Halabi</span><br />
        2022075454<br />
        mamayorga@estudiantec.cr
      </div>
      <div style={listItemStyle}>
        <span style={nameStyle}>Steven Porras Trejos</span><br />
        2023143714<br />
        stporras@estudiantec.cr
      </div>
      <div style={listItemStyle}>
        <span style={nameStyle}>Binjie Liang</span><br />
        2023064642<br />
        bliang@estudiantec.cr
      </div>
      <div style={listItemStyle}>
        <span style={nameStyle}>Miguel Alejandro Madrigal Ramírez</span><br />
        2020219677<br />
        alemarra99@estudiantec.cr
      </div>
      <div style={listItemStyle}>
        <span style={nameStyle}>Otto Segura Ruiz</span><br />
        2020426226<br />
        ottosegura@estudiantec.cr
      </div>
    </footer>
  );
}

export default Footer;