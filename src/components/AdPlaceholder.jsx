import React from 'react';

const AdPlaceholder = () => {
  const styles = {
    adPlaceholder: {
      margin: '3rem 0',
      textAlign: 'center'
    },
    adSpace: {
      backgroundColor: '#ecf0f1',
      border: '2px dashed #bdc3c7',
      padding: '4rem 2rem',
      color: '#7f8c8d',
      fontSize: '1.2rem'
    }
  };

  return (
    <div style={styles.adPlaceholder}>
      <div style={styles.adSpace}>Advertisement Space</div>
    </div>
  );
};

export default AdPlaceholder;