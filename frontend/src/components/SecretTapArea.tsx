import { useState } from "react";
import { PinModal } from "./PinModal";

export const SecretTapArea = () => {
  const [tapCount, setTapCount] = useState(0);
  const [showPin, setShowPin] = useState(false);

  const handleTap = () => {
    const next = tapCount + 1;
    setTapCount(next);

    if (next >= 3) {
      setShowPin(true);
      setTapCount(0);
    }

    setTimeout(() => setTapCount(0), 3000);
  };

  return (
    <>
      <div
        onClick={handleTap}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "60px",
          height: "60px",
          zIndex: 1000,
          backgroundColor: "transparent",
        }}
      />
      {showPin && <PinModal onClose={() => setShowPin(false)} />}
    </>
  );
};
