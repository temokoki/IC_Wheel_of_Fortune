import React, { useState, useEffect } from "react";
import Countdown from "./Countdown";
import { PieChart, Pie, Cell, Text, ResponsiveContainer } from "recharts";

const COLORS = ["gray", "#a55cff", "#d63df5", "#f53db8", "#f53d5c", "#f57a3d", "#f5d63d", "#b8f53d", "#5cf53d", "#3df57a", "#3df5d6"];
const RADIAN = Math.PI / 180;

export default function Wheel({ previousWinner, players, remainingSeconds, onCountdownFinished }) {
  const [wheelData, setWheelData] = useState([{ name: "", value: 1 }]);

  async function updateWheel() {
    const newData = new Array(players.length).fill().map((_, index) => { return { name: players[index].name, value: 100 } });
    newData.unshift({ name: "", value: players.length > 0 ? 0 : 1 })
    setWheelData(newData);
  }

  useEffect(() => { updateWheel() }, [players]);

  function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, index }) {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <Text
        x={x}
        y={y}
        angle={-midAngle + (x < cx ? 180 : 0)}
        dominantBaseline="middle"
        textAnchor="middle"
        fill="white"
        fontWeight="bold"
        fontSize="min(26px, 4vw)"
        style={{ pointerEvents: "none" }}
      >
        {wheelData[index].name}
      </Text >
    );
  };

  return (
    <div className="panel" style={{ textAlign: "center" }}>
      <div id="wheel" style={{ width: "100%", height: "min(80vw, 50vh)" }} >
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={wheelData}
              dataKey="value"
              startAngle={90}
              endAngle={450}
              innerRadius="22%"
              outerRadius="90%"
              animationDuration={500}
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {wheelData.map((_, index) => {
                const cellColor = COLORS[index % COLORS.length];
                return (
                  <Cell
                    key={"cell" + index}
                    fill={cellColor}
                    stroke="white"
                    strokeWidth={wheelData.length > 2 ? 2 : 0}
                    style={{
                      pointerEvents: "none",
                      filter: `drop-shadow(0px 0px 10px ${cellColor})`,
                      fillOpacity: players.length > 0 ? 0.6 : 0.4
                    }}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <span style={{
          position: "absolute", left: "50%", top: "5%",
          transform: "translate(-50%, -40%)", fontSize: "min(55px, 7vw)",
          textShadow: "0px 5px 7px #111111"
        }}>▼</span>

        {players.length < 2 ?
          <span style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -35%)", width: "90%",
            fontSize: "min(28px, 5vw)", fontWeight: "bold",
            textShadow: "2px 2px 4px #111111"
          }}>
            Waiting for players...
            <p style={{ margin: "10px", fontSize: "min(24px, 4vw)" }}>
              Previous winner: {previousWinner.name}
            </p>
          </span>
          :
          <Countdown remainingSeconds={remainingSeconds} onFinish={onCountdownFinished} />
        }
      </div>
      {players.length > 0 &&
        <p style={{ margin: "-1.5vh 0px 1vh", fontSize: "min(22px, 4vw)", fontWeight: "bold" }}>
          Total bet amount: {(players.length * 0.1).toFixed(1)}ICP
        </p>
      }
    </div>
  );
}