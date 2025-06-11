import React from 'react';

const AffiliateLinks = ({ links }) => {
  // Inline styles converted from Vue scoped styles
  const styles = {
    affiliateSection: {
      background: 'white',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    },
    h3: {
      marginBottom: '1rem',
      color: '#2c3e50'
    },
    affiliateLinks: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    },
    affiliateCard: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1rem',
      textAlign: 'center',
      transition: 'transform 0.2s, box-shadow 0.2s'
    },
    affiliateCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    },
    h4: {
      marginBottom: '0.5rem',
      color: '#2c3e50'
    },
    p: {
      marginBottom: '0.5rem',
      fontSize: '0.9rem'
    },
    link: {
      display: 'inline-block',
      backgroundColor: '#3498db',
      color: 'white',
      padding: '0.5rem 1rem',
      textDecoration: 'none',
      borderRadius: '4px',
      fontSize: '0.9rem',
      marginTop: '0.5rem',
      transition: 'background-color 0.2s'
    },
    linkHover: {
      backgroundColor: '#2980b9'
    },
    noLinks: {
      gridColumn: '1 / -1',
      textAlign: 'center',
      color: '#7f8c8d',
      fontStyle: 'italic'
    }
  };

  // State for hover effects
  const [hoveredCard, setHoveredCard] = React.useState(null);
  const [hoveredLink, setHoveredLink] = React.useState(null);

  return (
    <div style={styles.affiliateSection}>
      <h3 style={styles.h3}>Need More Points?</h3>
      <p>Check out these credit card offers to earn more points:</p>
      <div style={styles.affiliateLinks}>
        {links && links.length > 0 ? (
          links.map((link, index) => (
            <div 
              key={link.name}
              style={{
                ...styles.affiliateCard,
                ...(hoveredCard === index ? styles.affiliateCardHover : {})
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h4 style={styles.h4}>{link.name}</h4>
              <p style={styles.p}><strong>Bonus:</strong> {link.bonus}</p>
              <p style={styles.p}><strong>Annual Fee:</strong> {link.annualFee}</p>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener"
                style={{
                  ...styles.link,
                  ...(hoveredLink === index ? styles.linkHover : {})
                }}
                onMouseEnter={() => setHoveredLink(index)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Learn More
              </a>
            </div>
          ))
        ) : (
          <div style={styles.noLinks}>
            <p>Loading affiliate offers...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliateLinks;