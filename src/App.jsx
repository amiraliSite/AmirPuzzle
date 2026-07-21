import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaSun,
  FaMoon,
  FaRedo,
  FaChessKnight,
  FaChartLine,
  FaCheckCircle,
  FaTrophy,
  FaStar,
  FaFire,
  FaBolt,
  FaPlay,
} from "react-icons/fa";
import { GiTrophyCup, GiFireworkRocket, GiMountainRoad } from "react-icons/gi";
import { MdTimer } from "react-icons/md";

const LANDSCAPE_IMAGE =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop";

const GRID = 3;
const TOTAL = GRID * GRID;

export default function LandscapePuzzle() {
  const [pieces, setPieces] = useState([]);
  const [slots, setSlots] = useState(Array(TOTAL).fill(null));
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState(false);
  const [moves, setMoves] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [bestTime, setBestTime] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const dragNode = useRef(null);

  const shuffle = useCallback(() => {
    const arr = Array.from({ length: TOTAL }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setPieces(arr);
    setSlots(Array(TOTAL).fill(null));
    setTimer(0);
    setRunning(false);
    setSolved(false);
    setMoves(0);
    setShowHint(false);
  }, []);

  useEffect(() => {
    shuffle();
  }, [shuffle]);

  useEffect(() => {
    if (!running || solved) return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running, solved]);

  const checkWin = useCallback(
    (newSlots) => {
      const win = newSlots.every((piece, idx) => piece === idx);
      if (win) {
        setSolved(true);
        setRunning(false);
        if (!bestTime || timer < bestTime) {
          setBestTime(timer);
        }
      }
    },
    [timer, bestTime]
  );

  const handleDragStart = (e, pieceId, sourceSlot) => {
    if (!running) setRunning(true);
    dragNode.current = { pieceId, sourceSlot };
    e.dataTransfer.effectAllowed = "move";
    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetSlot) => {
    e.preventDefault();
    if (!dragNode.current) return;
    const { pieceId, sourceSlot } = dragNode.current;
    const newSlots = [...slots];
    const existingPiece = newSlots[targetSlot];

    if (sourceSlot !== null) newSlots[sourceSlot] = null;
    if (existingPiece !== null && sourceSlot !== null) {
      newSlots[sourceSlot] = existingPiece;
    }
    newSlots[targetSlot] = pieceId;
    setSlots(newSlots);
    setMoves((m) => m + 1);
    dragNode.current = null;
    checkWin(newSlots);
  };

  const handleDragEnd = () => {
    dragNode.current = null;
  };

  const formatTime = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  };

  const getRow = (i) => Math.floor(i / GRID);
  const getCol = (i) => i % GRID;
  const placedCount = slots.filter((s) => s !== null).length;
  const progress = Math.round((placedCount / TOTAL) * 100);

  const renderPiece = (pieceId, inBoard = false) => {
    const row = getRow(pieceId);
    const col = getCol(pieceId);
    // فقط چک میکنیم آیا این قطعه توی اسلات درست خودش هست یا نه
    const isCorrect = inBoard && slots[pieceId] === pieceId;

    return (
      <div
        key={pieceId}
        draggable
        onDragStart={(e) => {
          const sourceSlot = inBoard
            ? slots.indexOf(pieceId)
            : pieces.indexOf(pieceId);
          handleDragStart(e, pieceId, inBoard ? sourceSlot : null);
        }}
        onDragEnd={handleDragEnd}
        className={`
          relative rounded-lg sm:rounded-xl cursor-grab active:cursor-grabbing
          transition-all  duration-600 hover:scale-110 hover:z-10 w-full h-full
          ${isCorrect
            ? "ring-2 sm:ring-4 ring-green-400 shadow-lg shadow-green-400/50"
            : "shadow-md sm:shadow-xl"
          }
          ${darkMode
            ? "hover:shadow-2xl hover:shadow-orange-400/40"
            : "hover:shadow-2xl hover:shadow-blue-500/40"
          }
        `}
        style={{
          backgroundImage: `url(${LANDSCAPE_IMAGE})`,
          backgroundSize: `${GRID * 100}% ${GRID * 100}%`,
          backgroundPosition: `${(col / (GRID - 1)) * 100}% ${
            (row / (GRID - 1)) * 100
          }%`,
        }}
      >
        {/* بخش شماره حذف شد */}
        
        {/* فقط اگر درست بود تیک سبز نشون بده */}
        {isCorrect && (
          <span className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1 bg-gradient-to-r from-green-400 to-green-600 text-white text-[8px] sm:text-[10px] px-1 sm:px-2 py-0.5 rounded-md sm:rounded-lg font-black flex items-center gap-0.5 sm:gap-1 shadow-lg">
            <FaCheckCircle size={8} className="sm:hidden" />
            <FaCheckCircle size={10} className="hidden sm:inline" />
            <span className="hidden sm:inline">درست</span>
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={`
        min-h-screen transition-all duration-500 relative overflow-hidden
        ${
          darkMode
            ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
            : "bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100"
        }
      `}
      dir="rtl"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {darkMode ? (
          <>
            <div className="absolute top-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 w-48 sm:w-72 h-48 sm:h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          </>
        ) : (
          <>
            <div className="absolute top-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-blue-300/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-pink-300/30 rounded-full blur-3xl animate-pulse"></div>
          </>
        )}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`
          fixed top-2 left-2 sm:top-4 sm:left-4 z-50 p-2.5 sm:p-4 rounded-full shadow-2xl
          transition-all duration-300 hover:scale-110 hover:rotate-180
          ${
            darkMode
              ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-gray-900 shadow-yellow-500/50"
              : "bg-gradient-to-br from-slate-800 to-slate-900 text-yellow-400 shadow-blue-500/50"
          }
        `}
      >
        {darkMode ? <FaSun size={20} className="sm:hidden" /> : <FaMoon size={20} className="sm:hidden" />}
        {darkMode ? <FaSun size={24} className="hidden sm:inline" /> : <FaMoon size={24} className="hidden sm:inline" />}
      </button>

      {/* Hint Toggle */}
      <button
        onClick={() => setShowHint(!showHint)}
        className={`
          fixed top-2 right-2 sm:top-4 sm:right-4 z-50 p-2.5 sm:p-4 rounded-full shadow-2xl
          transition-all duration-300 hover:scale-110
          ${
            darkMode
              ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-blue-500/50"
              : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/50"
          }
        `}
      >
        <FaBolt size={20} className="sm:hidden" />
        <FaBolt size={24} className="hidden sm:inline" />
      </button>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1
            className={`
              text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-2 sm:mb-3
              ${darkMode ? "text-gradient-gold" : "text-gradient-rainbow"}
            `}
          >
            <GiMountainRoad className="inline-block mx-1 sm:mx-3 text-orange-400 animate-bounce-slow" />
            پازل منظره
          </h1>
          <p
            className={`
              text-sm sm:text-xl font-medium
              ${darkMode ? "text-gray-300" : "text-gray-600"}
            `}
          >
            قطعات رو بکش و جای درست بذار! 🧩
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8 max-w-4xl mx-auto">
          <div
            className={`
              p-3 sm:p-5 rounded-2xl sm:rounded-3xl backdrop-blur-xl border-2 transition-all duration-300
              hover:scale-105 hover:shadow-2xl
              ${
                darkMode
                  ? "bg-white/10 border-orange-400/30 text-white shadow-lg shadow-orange-400/20"
                  : "bg-white/80 border-orange-400/30 text-gray-800 shadow-lg shadow-orange-400/20"
              }
            `}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <MdTimer className="text-orange-400" size={18} />
              <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70 font-bold">
                زمان
              </span>
            </div>
            <div className="text-xl sm:text-3xl md:text-4xl font-black text-orange-400">
              {formatTime(timer)}
            </div>
          </div>

          <div
            className={`
              p-3 sm:p-5 rounded-2xl sm:rounded-3xl backdrop-blur-xl border-2 transition-all duration-300
              hover:scale-105 hover:shadow-2xl
              ${
                darkMode
                  ? "bg-white/10 border-blue-400/30 text-white shadow-lg shadow-blue-400/20"
                  : "bg-white/80 border-blue-400/30 text-gray-800 shadow-lg shadow-blue-400/20"
              }
            `}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <FaChessKnight className="text-blue-400" size={18} />
              <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70 font-bold">
                حرکات
              </span>
            </div>
            <div className="text-xl sm:text-3xl md:text-4xl font-black text-blue-400">
              {moves}
            </div>
          </div>

          <div
            className={`
              p-3 sm:p-5 rounded-2xl sm:rounded-3xl backdrop-blur-xl border-2 transition-all duration-300
              hover:scale-105 hover:shadow-2xl
              ${
                darkMode
                  ? "bg-white/10 border-green-400/30 text-white shadow-lg shadow-green-400/20"
                  : "bg-white/80 border-green-400/30 text-gray-800 shadow-lg shadow-green-400/20"
              }
            `}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <FaChartLine className="text-green-400" size={18} />
              <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70 font-bold">
                پیشرفت
              </span>
            </div>
            <div className="text-xl sm:text-3xl md:text-4xl font-black text-green-400">
              {progress}%
            </div>
          </div>

          <div
            className={`
              p-3 sm:p-5 rounded-2xl sm:rounded-3xl backdrop-blur-xl border-2 transition-all duration-300
              hover:scale-105 hover:shadow-2xl
              ${
                darkMode
                  ? "bg-white/10 border-purple-400/30 text-white shadow-lg shadow-purple-400/20"
                  : "bg-white/80 border-purple-400/30 text-gray-800 shadow-lg shadow-purple-400/20"
              }
            `}
          >
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <FaTrophy className="text-purple-400" size={18} />
              <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-70 font-bold">
                بهترین
              </span>
            </div>
            <div className="text-xl sm:text-3xl md:text-4xl font-black text-purple-400">
              {bestTime ? formatTime(bestTime) : "--:--"}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className={`
            w-full max-w-4xl mx-auto h-3 sm:h-4 rounded-full mb-6 sm:mb-10 overflow-hidden
            ${darkMode ? "bg-white/10" : "bg-gray-200"}
          `}
        >
          <div
            className="h-full bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 rounded-full transition-all duration-500 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 items-center justify-center">
          {/* Board */}
          <div className="flex flex-col items-center w-full lg:w-auto">
            <h3
              className={`
                text-base sm:text-xl font-black mb-3 sm:mb-5 flex items-center gap-2
                ${darkMode ? "text-gray-200" : "text-gray-700"}
              `}
            >
              <FaPlay className="text-green-400" />
              صفحه چیدمان
            </h3>
            <div
              className={`
                grid grid-cols-3 gap-1.5 sm:gap-3 p-2 sm:p-4 rounded-2xl sm:rounded-3xl border-2 backdrop-blur-xl
                transition-all duration-300
                ${
                  darkMode
                    ? "bg-white/5 border-white/20 shadow-2xl shadow-purple-500/20"
                    : "bg-white/60 border-gray-300 shadow-2xl shadow-blue-500/20"
                }
              `}
            >
              {Array.from({ length: TOTAL }, (_, slotIdx) => {
                const pieceId = slots[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    className={`
                      w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-lg sm:rounded-2xl border-2 border-dashed
                      flex items-center justify-center transition-all duration-300
                      ${
                        hoveredSlot === slotIdx && pieceId === null
                          ? darkMode
                            ? "border-orange-400 bg-orange-400/20 scale-105"
                            : "border-blue-400 bg-blue-400/20 scale-105"
                          : darkMode
                          ? "border-white/30"
                          : "border-gray-400"
                      }
                    `}
                    onDragOver={handleDragOver}
                    onDragEnter={() => setHoveredSlot(slotIdx)}
                    onDragLeave={() => setHoveredSlot(null)}
                    onDrop={(e) => {
                      setHoveredSlot(null);
                      handleDrop(e, slotIdx);
                    }}
                  >
                    {pieceId !== null ? (
                      renderPiece(pieceId, true)
                    ) : (
                      <span
                        className={`
                          text-xl sm:text-3xl font-black
                          ${darkMode ? "text-white/30" : "text-gray-400"}
                        `}
                      >
                        {slotIdx + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pieces Tray */}
          <div className="flex flex-col items-center w-full lg:w-auto">
            <h3
              className={`
                text-base sm:text-xl font-black mb-3 sm:mb-5 flex items-center gap-2
                ${darkMode ? "text-gray-200" : "text-gray-700"}
              `}
            >
              <FaFire className="text-orange-400" />
              قطعات پازل
            </h3>

            <div className="relative mb-3 sm:mb-5">
              <img
                src={LANDSCAPE_IMAGE}
                alt="reference"
                className={`
                  w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-xl sm:rounded-2xl object-cover border-2 sm:border-4
                  transition-all duration-300 hover:scale-105
                  ${
                    darkMode
                      ? "border-orange-400/50 shadow-2xl shadow-orange-400/30"
                      : "border-blue-400/50 shadow-2xl shadow-blue-400/30"
                  }
                `}
              />
              <div
                className={`
                  absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 sm:px-4 py-0.5 sm:py-1 rounded-full
                  text-[10px] sm:text-xs font-black backdrop-blur-xl
                  ${darkMode ? "bg-black/70 text-white" : "bg-white/90 text-gray-800"}
                `}
              >
                تصویر مرجع
              </div>
            </div>

            <div
              className={`
                grid grid-cols-3 gap-1.5 sm:gap-3 p-2 sm:p-4 rounded-2xl sm:rounded-3xl border-2 backdrop-blur-xl
                transition-all duration-300
                ${
                  darkMode
                    ? "bg-white/5 border-white/20 shadow-2xl shadow-purple-500/20"
                    : "bg-white/60 border-gray-300 shadow-2xl shadow-blue-500/20"
                }
              `}
            >
              {pieces.map((pieceId) => {
                if (slots.includes(pieceId)) {
                  return (
                    <div
                      key={pieceId}
                      className={`
                        w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-lg sm:rounded-2xl border-2 border-dashed
                        ${
                          darkMode
                            ? "border-white/10 bg-white/5"
                            : "border-gray-300 bg-gray-100"
                        }
                      `}
                    />
                  );
                }
                return (
                  <div
                    key={pieceId}
                    className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36"
                  >
                    {renderPiece(pieceId, false)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="text-center mt-6 sm:mt-10">
          <button
            onClick={shuffle}
            className={`
              px-6 sm:px-10 py-3 sm:py-5 rounded-xl sm:rounded-2xl font-black text-base sm:text-xl
              transition-all duration-300 hover:scale-110 hover:shadow-2xl
              flex items-center gap-2 sm:gap-3 mx-auto
              ${
                darkMode
                  ? "bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 text-white shadow-2xl shadow-orange-500/50"
                  : "bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/50"
              }
            `}
          >
            <FaRedo size={18} className="sm:hidden" />
            <FaRedo size={24} className="hidden sm:inline" />
            شروع دوباره
          </button>
        </div>
      </div>

      {/* Hint Overlay */}
      {showHint && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          onClick={() => setShowHint(false)}
        >
          <div className="relative max-w-[90vmin]">
            <img
              src={LANDSCAPE_IMAGE}
              alt="hint"
              className="w-full h-auto rounded-2xl sm:rounded-3xl border-4 border-orange-400 shadow-2xl shadow-orange-400/50"
            />
            <button
              className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white p-2 sm:p-3 rounded-full hover:scale-110 transition-transform"
              onClick={() => setShowHint(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Win Overlay */}
      {solved && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 animate-[fadeIn_0.5s_ease] p-4">
          {/* Confetti */}
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="fixed w-3 h-3 sm:w-4 sm:h-4 rounded-full"
              style={{
                top: "-20px",
                left: `${Math.random() * 100}%`,
                background: [
                  "#ffd700",
                  "#ff6b6b",
                  "#4ecdc4",
                  "#a855f7",
                  "#ff8c00",
                  "#10b981",
                ][i % 6],
                animation: `confetti ${2 + Math.random() * 3}s linear ${
                  Math.random() * 2
                }s infinite`,
                zIndex: 999,
              }}
            />
          ))}

          <div
            className={`
              p-6 sm:p-10 md:p-16 rounded-2xl sm:rounded-3xl border-4 text-center max-w-md sm:max-w-2xl w-full
              animate-glow
              ${
                darkMode
                  ? "bg-gradient-to-br from-gray-800 via-purple-900 to-gray-900 border-orange-400"
                  : "bg-gradient-to-br from-white via-blue-50 to-purple-50 border-blue-400"
              }
            `}
          >
            <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 animate-bounce-slow">
              <GiTrophyCup className="inline-block text-orange-400" />
            </div>
            <h2
              className={`
                text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6
                ${darkMode ? "text-gradient-gold" : "text-gradient-rainbow"}
              `}
            >
              <GiFireworkRocket className="inline-block mx-1 sm:mx-2" />
              آفرین! موفق شدید
              <GiFireworkRocket className="inline-block mx-1 sm:mx-2" />
            </h2>
            <p
              className={`
                text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 leading-relaxed
                ${darkMode ? "text-gray-200" : "text-gray-700"}
              `}
            >
              شما پازل منظره رو با موفقیت کامل کردید! 🎉
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div
                className={`
                  p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2
                  ${
                    darkMode
                      ? "bg-white/10 border-orange-400/30"
                      : "bg-white/80 border-blue-400/30"
                  }
                `}
              >
                <MdTimer className="inline-block text-orange-400 mb-1 sm:mb-2" size={24} />
                <div
                  className={`text-xs sm:text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  زمان
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-black ${
                    darkMode ? "text-orange-400" : "text-blue-600"
                  }`}
                >
                  {formatTime(timer)}
                </div>
              </div>
              <div
                className={`
                  p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2
                  ${
                    darkMode
                      ? "bg-white/10 border-blue-400/30"
                      : "bg-white/80 border-purple-400/30"
                  }
                `}
              >
                <FaChessKnight
                  className="inline-block text-blue-400 mb-1 sm:mb-2"
                  size={24}
                />
                <div
                  className={`text-xs sm:text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  حرکات
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-black ${
                    darkMode ? "text-blue-400" : "text-purple-600"
                  }`}
                >
                  {moves}
                </div>
              </div>
            </div>

            {bestTime === timer && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 text-white font-black text-base sm:text-xl animate-pulse">
                <FaStar className="inline-block ml-1 sm:ml-2" />
                رکورد جدید! 🏆
              </div>
            )}

            <button
              onClick={shuffle}
              className={`
                px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl md:text-2xl
                transition-all duration-300 hover:scale-110 hover:shadow-2xl
                flex items-center gap-2 sm:gap-3 mx-auto
                ${
                  darkMode
                    ? "bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 text-white shadow-2xl shadow-orange-500/50"
                    : "bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white shadow-2xl shadow-purple-500/50"
                }
              `}
            >
              <FaRedo size={20} className="sm:hidden" />
              <FaRedo size={28} className="hidden sm:inline" />
              بازی دوباره
            </button>
          </div>
        </div>
      )}
    </div>
  );
}