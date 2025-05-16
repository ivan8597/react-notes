import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_SOCKET_URL);

const NotificationBell = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    socket.on('news-update', () => {
      setCount(c => c + 1);
    });
    return () => socket.off('news-update');
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <span role="img" aria-label="bell">🔔</span>
      {count > 0 && (
        <span style={{
          position: 'absolute', top: 0, right: 0, background: 'red',
          color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: 12
        }}>
          {count}
        </span>
      )}
    </div>
  );
};

export default NotificationBell;