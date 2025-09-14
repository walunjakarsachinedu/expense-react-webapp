import { useEffect } from 'react';
import useExpenseStore from '../store/usePersonStore';

function SyncState() {
  const syncState = useExpenseStore(store => store.syncState);
  const setSyncState = useExpenseStore(store => store.setSyncState);

  useEffect(() => {
    if (syncState === 'synced') {
      const timer = setTimeout(() => setSyncState('none'), 2000);
      return () => clearTimeout(timer);
    }
  }, [syncState, setSyncState]);

  const getIcon = () => {
    const iconPath = "/icons";
    switch (syncState) {
      case 'synced':
        return `${iconPath}/Sync-Icon.svg`;
      case 'syncing':
        return `${iconPath}/Syncing-Icon.svg`;
      case 'unSync':
        return `${iconPath}/UnSync-Icon.svg`;
      case 'syncError':
        return `${iconPath}/UnSync-Error-Icon.svg`;
      default:
        return '';
    }
  };

  return syncState == "none"
    ? <div style={{ width: 23 }}></div>
    : getIcon() && (
      <img src={getIcon()} alt={syncState} style={{ height: 16 }} />
    );
}

export default SyncState;
