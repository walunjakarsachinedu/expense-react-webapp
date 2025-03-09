import useIsOffline from "../hooks/useIsOffline";

const OfflineAlert = () => {
  const isOffline = useIsOffline();

  if (!isOffline) return null;

  return (
    <div className="left-0 w-full p-1 flex align-items-center justify-content-center bg-yellow-500 text-gray-900">
      <i className="pi pi-info-circle mr-2"></i>
      <span>Offline: Changes will sync later.</span>
    </div>
  );
};

export default OfflineAlert;
