import{ useRef } from 'react';
import { useState } from "react";
import { useEffect } from "react";
import axios from 'axios';

type MediaItem = {
  media_id: number;
  url: string;
  type: 'video' | 'image';
  title: string;
};

const IMAGE_DURATION = 10000; // milliseconds

const Signage: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch assigned media list from local API or DB
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        // Replace this with your actual API or local endpoint
        const res = await axios.get<MediaItem[]>('http://localhost:5000/api/media');
        setMediaList(res.data);
      } catch (err) {
        console.error('Failed to fetch media:', err);
      }
    };

    fetchMedia();
  }, []);

  // Handle image timer and video ended
  useEffect(() => {
    if (mediaList.length === 0) return;

    const currentMedia = mediaList[currentIndex];

    if (currentMedia.type === 'image') {
      // Set timeout to go to next image
      timeoutRef.current = setTimeout(() => {
        goToNext();
      }, IMAGE_DURATION);
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
            src={currentMedia.url}
            autoPlay
            muted
            playsInline
            disablePictureInPicture
            controls={false}
            controlsList="nodownload nofullscreen noremoteplayback"
            onEnded={goToNext}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
        ) : (
          <img
            src={currentMedia.url}
            alt={currentMedia.title}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
        )
      ) : (
        <p style={{ color: 'white' }}>Loading media...</p>
      )}
    </div>
  );
};

export default Signage;
