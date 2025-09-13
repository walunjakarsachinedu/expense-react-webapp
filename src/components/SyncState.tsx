import { useEffect } from 'react';
import useExpenseStore from '../store/usePersonStore';

function SyncState() {
  const syncState = useExpenseStore(store => store.syncState);
  const setSyncState = useExpenseStore(store => store.setSyncState);

  useEffect(() => {
    if (syncState === 'synced') {
      const timer = setTimeout(() => setSyncState(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [syncState, setSyncState]);

  const getIcon = () => {
    switch (syncState) {
      case 'synced':
        return '/src/assets/icons/Sync-Icon.svg';
      case 'syncing':
        return '/src/assets/icons/Syncing-Icon.svg';
      case 'unSync':
        return '/src/assets/icons/UnSync-Icon.svg';
      case 'syncError':
        return '/src/assets/icons/UnSync-Error-Icon.svg';
      default:
        return '';
    }
  };

  return syncState == ""
    ? <div style={{ width: 23 }}></div>
    : getIcon() && (
      <img src={getIcon()} alt={syncState} style={{ height: 16 }} />
    );
}

export default SyncState;
