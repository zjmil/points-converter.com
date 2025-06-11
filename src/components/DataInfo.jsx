import React, { useMemo } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'

const DataInfo = ({ conversions, dataSource }) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const lastUpdatedText = useMemo(() => {
    if (!conversions || conversions.length === 0) {
      return 'Last updated: Loading...'
    }
    
    // Find the most recent update across all conversions
    const mostRecentUpdate = conversions
      .filter(conv => conv.lastUpdated)
      .map(conv => new Date(conv.lastUpdated))
      .reduce((latest, current) => current > latest ? current : latest, new Date(0))
    
    if (mostRecentUpdate.getTime() === 0) {
      return 'Last updated: Unknown'
    }
    
    return `Last updated: ${mostRecentUpdate.toLocaleDateString()}`
  }, [conversions])

  const dataSourceText = useMemo(() => {
    return dataSource ? `Source: ${dataSource}` : 'Source: Loading...'
  }, [dataSource])

  const dataInfoStyle = {
    backgroundColor: '#e8f4f8',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
    fontSize: '0.9rem',
    ...(isMobile && {
      flexDirection: 'column',
      textAlign: 'center',
    })
  }

  return (
    <div style={dataInfoStyle}>
      <span>{lastUpdatedText}</span>
      <span>{dataSourceText}</span>
    </div>
  )
}

export default DataInfo