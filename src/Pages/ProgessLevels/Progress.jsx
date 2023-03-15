import React, { useState } from "react";
import "./Progress.css";
import bronze from "../../images/bronze.png";
import silver from "../../images/silver.png";
import gold from "../../images/gold.png";

function Progress() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const levelImages = [
    { level: 1, src: `${bronze}`, status: "bronze" },
    { level: 2, src: `${bronze}`, status: "bronze" },
    { level: 3, src: `${bronze}`, status: "bronze" },
    { level: 4, src: `${silver}`, status: "silver" },
    { level: 5, src: `${silver}`, status: "silver" },
    { level: 6, src: `${silver}`, status: "silver" },
    { level: 7, src: `${gold}`, status: "gold" },
  ];

  const currentImage = levelImages.find(
    (image) => image.level === currentLevel
  ).src;

  const handleLevelUp = () => {
    setCurrentLevel(currentLevel + 1);
  };

  return (
    <div>
      <img src={currentImage} alt={`Level ${currentLevel}`} />
      <h3>{`You're a ${currentLevel}-level cook!`}</h3>
      <button onClick={handleLevelUp}>I cooked at home today!</button>
    </div>
  );
}

export default Progress;
