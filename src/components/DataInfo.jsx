import { useMemo } from 'react'
import styles from './DataInfo.module.css'

const DataInfo = ({ conversions, dataSource }) => {
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


  return (
    <div className={styles.dataInfo}>
      <span>{lastUpdatedText}</span>
      <span>{dataSourceText}</span>
    </div>
  )
}

export default DataInfo