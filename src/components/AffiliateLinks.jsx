import React from 'react';
import styles from './AffiliateLinks.module.css';

const AffiliateLinks = ({ links }) => {

  return (
    <div className={styles.affiliateSection}>
      <h3 className={styles.h3}>Need More Points?</h3>
      <p>Check out these credit card offers to earn more points:</p>
      <div className={styles.affiliateLinks}>
        {links && links.length > 0 ? (
          links.map((link, index) => (
            <div 
              key={link.name}
              className={styles.affiliateCard}
            >
              <h4 className={styles.h4}>{link.name}</h4>
              <p className={styles.p}><strong>Bonus:</strong> {link.bonus}</p>
              <p className={styles.p}><strong>Annual Fee:</strong> {link.annualFee}</p>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener"
                className={styles.link}
              >
                Learn More
              </a>
            </div>
          ))
        ) : (
          <div className={styles.noLinks}>
            <p>Loading affiliate offers...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliateLinks;