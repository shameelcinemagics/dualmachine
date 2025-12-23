import { useRef, useState, useEffect } from 'react';
import axios from 'axios';

type MediaItem = {
  media_id: number;
  url: string;
  type: 'video' | 'image';
  title: string;
};

const IMAGE_DURATION = 10000; // milliseconds
const POLL_INTERVAL = 600000; // 10 minutes

const Signage: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🔁 Fetch media function
  const fetchMedia = async () => {
    try {
      const res = await axios.get<MediaItem[]>('http://localhost:5000/api/media');

      setMediaList((prev) => {
        // 🔍 Prevent unnecessary resets
        if (JSON.stringify(prev) !== JSON.stringify(res.data)) {
          return res.data;
        }
        return prev;
      });
    } catch (err) {
      console.error('Failed to fetch media:', err);
    }
  };

  // ✅ Initial fetch + polling every 15s
  useEffect(() => {
    fetchMedia(); // initial load

    const interval = setInterval(fetchMedia, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // ⏱ Handle image timer
  useEffect(() => {
    if (mediaList.length === 0) return;

    const currentMedia = mediaList[currentIndex];

    if (currentMedia.type === 'image') {
      timeoutRef.current = setTimeout(goToNext, IMAGE_DURATION);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, mediaList]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaList.length);
  };

  const currentMedia = mediaList[currentIndex];

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: 'black',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {currentMedia ? (
        currentMedia.type === 'video' ? (
          <video
            key={currentMedia.media_id} // 🔑 ensures reload if video changes
            src={currentMedia.url}
            autoPlay
            muted
            playsInline
            controls={false}
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            onEnded={goToNext}
            onContextMenu={(e) => e.preventDefault()}
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        ) : (
          <img
            src={currentMedia.url}
            alt={currentMedia.title}
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        )
      ) : (
        <p style={{ color: 'white' }}>Loading media...</p>
      )}
    </div>
  );
};

export default Signage;