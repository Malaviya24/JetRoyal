import React, { useEffect } from "react";
import "./bets.scss";

// Generate fake top players data
function generateFakeTopData(period: string) {
  const names = [
    "Rahul_K", "Priya_M", "Amit_S", "Sneha_R", "Vikram_P",
    "Anita_D", "Raj_Kumar", "Deepak_V", "Pooja_N", "Suresh_T",
    "Kavita_G", "Manoj_B", "Ritu_S", "Arun_L", "Neha_J",
    "Sanjay_W", "Divya_C", "Rohit_A", "Meena_H", "Kiran_F",
    "Lucky777", "BigBoss99", "CrashPro", "HighRoller", "JetWin",
    "StarPlayer", "GoldMiner", "RocketBet", "AceHigh", "TopGun",
    "Arjun_99", "Simran_D", "Mohit_K", "Anjali_P", "Ravi_S",
    "Nisha_T", "Gaurav_M", "Swati_R", "Vishal_B", "Komal_N",
  ];

  const multiplier = period === "day" ? 1 : period === "month" ? 5 : 20;
  const count = 10 + Math.floor(Math.random() * 5);

  // Shuffle names
  const shuffled = [...names].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, count).map((name) => {
    const betAmount = Math.floor(Math.random() * 2000) + 50;
    const cashoutAt = Math.round((Math.random() * 8 + 1.2) * 100) / 100;
    return {
      name,
      betAmount: betAmount * multiplier,
      cashoutAt,
      win: betAmount * multiplier * cashoutAt,
    };
  }).sort((a, b) => b.win - a.win);
}

const TopHistory = () => {
  const [type, setType] = React.useState(0);
  const [history, setHistory] = React.useState<any[]>([]);

  useEffect(() => {
    setHistory(generateFakeTopData("day"));
  }, []);

  const handleTabClick = (idx: number, period: string) => {
    setType(idx);
    setHistory(generateFakeTopData(period));
  };

  return (
    <>
      <div className="navigation-switcher-wrapper">
        <div className="navigation-switcher">
          <div
            className="slider"
            style={{ transform: `translate(${100 * type}px)` }}
          ></div>
          <button onClick={() => handleTabClick(0, "day")} className="tab">Day</button>
          <button onClick={() => handleTabClick(1, "month")} className="tab">Month</button>
          <button onClick={() => handleTabClick(2, "year")} className="tab">Year</button>
        </div>
      </div>
      <div className="top-list-wrapper">
        <div className="top-items-list scroll-y h-100">
          {history.map((item: any, index: number) => (
            <div key={index} className="bet-item">
              <div className="main">
                <div className="icon">
                  <div className="username">{item.name?.slice(0, 1) + "***" + item.name?.slice(-1)}</div>
                </div>
                <div className="score">
                  <div className="flex">
                    <div><span>Bet, INR:&nbsp;</span></div>
                    <span className="amount">{item.betAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex">
                    <div><span>Cashed out:&nbsp;</span></div>
                    <span className="amount cashout">{item.cashoutAt.toFixed(2)}x</span>
                  </div>
                  <div className="flex">
                    <div><span>Win, INR:&nbsp;</span></div>
                    <span className="amount">{item.win.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TopHistory;
