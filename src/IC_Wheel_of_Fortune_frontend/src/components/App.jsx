import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import Wheel from "./Wheel";
import Balance from "./Balance";
import Authentication from "./Authentication";
import { AUTH_PRINCIPAL } from "../index";
import { IC_Wheel_of_Fortune_backend as gameBackend } from "../../../declarations/IC_Wheel_of_Fortune_backend";

export default function App() {
  const [previousWinner, setPreviousWinner] = useState([]);
  const [players, setPlayers] = useState([]);
  const [remainingSeconds, setRemainingSeconds] = useState(-1);
  const [isWaitingResults, setWaitingResults] = useState(false);

  const playersRef = useRef();
  const isWaitingRef = useRef();
  useEffect(() => {
    playersRef.current = players;
    isWaitingRef.current = isWaitingResults
  });

  useEffect(() => {
    getPreviousWinner();
    getGameStatus();
    let interval = setInterval(getGameStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  async function getPreviousWinner() {
    const prevWinner = await gameBackend.getPreviousWinner();

    if (prevWinner[0] != undefined)
      setPreviousWinner(prevWinner[0]);
  }

  async function getGameStatus() {
    if (isWaitingRef.current)
      return;

    const status = await gameBackend.getGameStatus();
    const seconds = parseInt(parseFloat(status.remainingTime) / 1000000000);

    if (seconds >= 0 && seconds <= 5) {
      setWaitingResults(true);
      return;
    }

    if (playersRef.current.length < status.players[0].length) {
      setPlayers(status.players[0].reverse());
      setRemainingSeconds(seconds);
    }
  }

  return (
    <div>
      <Header />
      <Wheel previousWinner={previousWinner} players={players} remainingSeconds={remainingSeconds}
        onCountdownFinished={() => {
          spinWheel(playersRef.current, async () => {
            const prevWinner = await gameBackend.getPreviousWinner();
            setPreviousWinner(prevWinner[0]);
            setPlayers([]);
            setWaitingResults(false);
          })
        }}
      />
      {AUTH_PRINCIPAL.length > 0 && <Balance onParticipate={() => getGameStatus()} />}
      <Authentication />
    </div>
  );
}

async function spinWheel(players, callback) {
  const prevWinner = await gameBackend.getPreviousWinner();
  const winnerPrincipal = prevWinner[0].principal.toString();
  const winnerIndex = players.map(p => p.principal.toString()).indexOf(winnerPrincipal);

  const wheel = document.querySelector(".recharts-surface");
  const sliceSize = 360 / parseFloat(players.length);
  const randomSpinCount = 7 + Math.floor(Math.random() * 3);
  const sliceRandomOffset = sliceSize * 0.1 + Math.random() * sliceSize * 0.8;
  const wheelTotalOffset = sliceSize * winnerIndex + sliceRandomOffset;
  const rotationDegrees = 360 * randomSpinCount + wheelTotalOffset;
  wheel.style.transform = `rotate(${rotationDegrees}deg)`;

  const randomTime = Math.floor(4 + Math.random() * 2);
  wheel.style.transition = `all ${randomTime}s cubic-bezier(0.3, -0.08, 0.3, 1.02)`;
  wheel.style.animationDuration = `${randomTime}s`;
  wheel.classList.add("spinBlur");

  setTimeout(() => {
    var end = Date.now() + 200;
    if (winnerPrincipal === AUTH_PRINCIPAL) {
      (function frame() {
        confetti({
          particleCount: 100,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: Math.random(),
            y: Math.random() - 0.25
          }
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }())
    };
  }, 1000 * randomTime);

  setTimeout(() => {
    wheel.classList.remove("spinBlur");
    wheel.style.transition = "none";
    wheel.style.transform = "rotate(0deg)";
    callback();
  }, 1000 * randomTime + 4000);
}