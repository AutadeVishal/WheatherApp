import { useState, useEffect } from 'react';

export function useLastUpdated(timestamp: number | null) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (!timestamp) { setLabel(''); return; }

    const update = () => {
      const secs = Math.floor((Date.now() - timestamp) / 1000);
      if (secs < 60)  setLabel(`${secs}s ago`);
      else if (secs < 3600) setLabel(`${Math.floor(secs / 60)}m ago`);
      else setLabel(`${Math.floor(secs / 3600)}h ago`);
    };

    update();
    const id = setInterval(update, 10000);
    return () => clearInterval(id);
  }, [timestamp]);

  return label;
}
