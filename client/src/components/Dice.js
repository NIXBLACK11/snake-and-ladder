import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import PropTypes from "prop-types";

const diceSound = new Audio("/dice.mp3");

const Dice = forwardRef(
  ({ disabled = false, rollingTime = 700, size = 100, onRoll, sound }, ref) => {
    const [rolling, setRolling] = useState(false);
    const [rotationX, setRotationX] = useState(0);
    const [rotationY, setRotationY] = useState(0);
    const [rotationZ, setRotationZ] = useState(0);
    const [programmaticRoll, setProgrammaticRoll] = useState(null);

    useImperativeHandle(ref, () => ({
      rollToValue(value) {
        if (value >= 1 && value <= 6) {
          // Validate dice value
          setProgrammaticRoll(value);
        }
      },
    }));

    const rollDice = (forcedValue) => {
      if (rolling || disabled) return; // Prevent rolling if disabled or already rolling

      setRolling(true);
      diceSound.play();
      const duration = rollingTime; // Duration in milliseconds
      const startTime = Date.now();

      const roll = () => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        if (progress < 1) {
          setRotationX(Math.random() * 360 * 5);
          setRotationY(Math.random() * 360 * 5);
          setRotationZ(Math.random() * 360 * 5);
          requestAnimationFrame(roll);
        } else {
          const value = forcedValue || Math.floor(Math.random() * 6) + 1;
          setFinalRotation(value);
          setRolling(false);
          if (onRoll && forcedValue === null) onRoll(value);
        }
      };

      requestAnimationFrame(roll);
    };

    const setFinalRotation = (value) => {
      switch (value) {
        case 1:
          setRotationX(0);
          setRotationY(0);
          setRotationZ(0);
          break;
        case 2:
          setRotationX(0);
          setRotationY(-90);
          setRotationZ(0);
          break;
        case 3:
          setRotationX(90);
          setRotationY(0);
          setRotationZ(0);
          break;
        case 4:
          setRotationX(-90);
          setRotationY(0);
          setRotationZ(0);
          break;
        case 5:
          setRotationX(0);
          setRotationY(90);
          setRotationZ(0);
          break;
        case 6:
          setRotationX(180);
          setRotationY(0);
          setRotationZ(0);
          break;
        default:
          break;
      }
    };

    useEffect(() => {
      if (programmaticRoll !== null) {
        rollDice(programmaticRoll);
        setProgrammaticRoll(null); // Reset after rolling programmatically
      }
    }, [programmaticRoll]);

    // Calculate dynamic dot sizes and positions
    const dotSize = Math.floor(size / 7);
    const dotOffset = Math.floor(size / 5);

    return (
      <div
        className={`scene ${disabled ? "disabled" : ""}`}
        onClick={() => !disabled && onRoll && !programmaticRoll && onRoll(null)} // Call onRoll but not initiate dice roll
      >
        <div
          className="cube"
          style={{
            transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`,
            width: size,
            height: size,
          }}
        >
          <div className="cube__face cube__face--1">
            <span
              className="dot center"
              style={{
                width: dotSize,
                height: dotSize,
                top: `calc(50% - ${dotSize / 2}px)`,
                left: `calc(50% - ${dotSize / 2}px)`,
              }}
            ></span>
          </div>
          <div className="cube__face cube__face--2">
            <span
              className="dot top-left"
              style={{
                width: dotSize,
                height: dotSize,
                top: dotOffset,
                left: dotOffset,
              }}
            ></span>
            <span
              className="dot bottom-right"
              style={{
                width: dotSize,
                height: dotSize,
                bottom: dotOffset,
                right: dotOffset,
              }}
            ></span>
          </div>
          <div className="cube__face cube__face--3">
            <span
              className="dot top-left"
              style={{
                width: dotSize,
                height: dotSize,
                top: dotOffset,
                left: dotOffset,
              }}
            ></span>
            <span
              className="dot center"
              style={{
                width: dotSize,
                height: dotSize,
                top: `calc(50% - ${dotSize / 2}px)`,
                left: `calc(50% - ${dotSize / 2}px)`,
              }}
            ></span>
            <span
              className="dot bottom-right"
              style={{
                width: dotSize,
                height: dotSize,
                bottom: dotOffset,
                right: dotOffset,
              }}
            ></span>
          </div>
          <div className="cube__face cube__face--4">
            <span
              className="dot top-left"
              style={{
                width: dotSize,
                height: dotSize,
                top: dotOffset,
                left: dotOffset,
              }}
            ></span>
            <span
              className="dot top-right"
              style={{
                width: dotSize,
                height: dotSize,
                top: dotOffset,
                right: dotOffset,
              }}
            ></span>
            <span
              className="dot bottom-left"
              style={{
                width: dotSize,
                height: dotSize,
                bottom: dotOffset,
                left: dotOffset,
              }}
            ></span>
            <span
              className="dot bottom-right"
              style={{
                width: dotSize,
                height: dotSize,
                bottom: dotOffset,
                right: dotOffset,
              }}
            ></span>
          </div>
          <div className="cube__face cube__face--5">
            <span
              className="dot top-left"
              style={{
                width: dotSize,
                height: dotSize,
                top: dotOffset,
                left: dotOffset,
              }}
            ></span>
            <span
              className="dot top-right"
              style={{
                width: dotSize,
                height: dotSize,
                top: dotOffset,
                right: dotOffset,
              }}
            ></span>
            <span
              className="dot center"
              style={{
                width: dotSize,
                height: dotSize,
                top: `calc(50% - ${dotSize / 2}px)`,
                left: `calc(50% - ${dotSize / 2}px)`,
              }}
            ></span>
            <span
              className="dot bottom-left"
              style={{
                width: dotSize,
                height: dotSize,
                bottom: dotOffset,
                left: dotOffset,
              }}
            ></span>
            <span
              className="dot bottom-right"
              style={{
                width: dotSize,
                height: dotSize,
                bottom: dotOffset,
                right: dotOffset,
              }}
            ></span>
          </div>
          <div className="cube__face cube__face--6">
            <span
              className="dot top-left"
              style={{
                width: dotSize,
                height: dotSize,
                top: dotOffset,
                left: dotOffset,
              }}
            ></span>
            <span
              className="dot top-right"
              style={{
                width: dotSize,
                height: dotSize,
                top: dotOffset,
                right: dotOffset,
              }}
            ></span>
            <span
              className="dot middle-left"
              style={{
                width: dotSize,
                height: dotSize,
                top: `calc(50% - ${dotSize / 2}px)`,
                left: dotOffset,
              }}
            ></span>
            <span
              className="dot middle-right"
              style={{
                width: dotSize,
                height: dotSize,
                top: `calc(50% - ${dotSize / 2}px)`,
                right: dotOffset,
              }}
            ></span>
            <span
              className="dot bottom-left"
              style={{
                width: dotSize,
                height: dotSize,
                bottom: dotOffset,
                left: dotOffset,
              }}
            ></span>
            <span
              className="dot bottom-right"
              style={{
                width: dotSize,
                height: dotSize,
                bottom: dotOffset,
                right: dotOffset,
              }}
            ></span>
          </div>
        </div>
        <style>{`
        .scene {
          width: ${size}px;
          height: ${size}px;
          perspective: ${size * 4}px;
          cursor: ${disabled ? "not-allowed" : "pointer"};
          opacity: ${disabled ? 0.5 : 1};
        }
        .cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform ${rollingTime}ms;
        }
        .cube__face {
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          border: 2px solid #000;
          background: white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.1);
          border-radius: 20px;
        }
        .cube__face--1 { transform: rotateY(0deg) translateZ(${size / 2}px); }
        .cube__face--2 { transform: rotateY(90deg) translateZ(${size / 2}px); }
        .cube__face--3 { transform: rotateX(-90deg) translateZ(${size / 2}px); }
        .cube__face--4 { transform: rotateX(90deg) translateZ(${size / 2}px); }
        .cube__face--5 { transform: rotateY(-90deg) translateZ(${size / 2}px); }
        .cube__face--6 { transform: rotateY(180deg) translateZ(${size / 2}px); }
        .dot {
          position: absolute;
          border-radius: 50%;
          background-color: #000;
        }
      `}</style>
      </div>
    );
  },
);

Dice.propTypes = {
  disabled: PropTypes.bool,
  rollingTime: PropTypes.number,
  size: PropTypes.number,
  onRoll: PropTypes.func,
  sound: PropTypes.string,
};

export default Dice;
