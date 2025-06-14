import { useMemo } from 'react';
import styles from './ProgramIcon.module.css';
import { getIconClassName, ICON_MAPPINGS } from './utils';

const ProgramIcon = ({ programId, type, size = 'small' }) => {
  
  const iconSymbol = useMemo(() => {
    return ICON_MAPPINGS.programs[programId] || 
           ICON_MAPPINGS.types[type] || 
           ICON_MAPPINGS.default;
  }, [programId, type]);


  return (
    <span className={getIconClassName(styles, size, type, programId)}>
      {iconSymbol}
    </span>
  );
};

export default ProgramIcon;