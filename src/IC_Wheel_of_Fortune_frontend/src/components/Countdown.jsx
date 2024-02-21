import React, { useState, useEffect } from "react";

export default function Countdown({ remainingSeconds, onFinish }) {
  const [timer, setTimer] = useState(remainingSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      remainingSeconds--;
      setTimer(remainingSeconds);

      if (remainingSeconds == 0) {
        clearInterval(interval);
        onFinish();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {timer > 0 &&
        <div id="countDown">
          Spin in <p style={{ margin: "5px", fontSize: "min(36px, 6vw)" }}>{timer}</p>
        </div>
      }
    </>
  );
}