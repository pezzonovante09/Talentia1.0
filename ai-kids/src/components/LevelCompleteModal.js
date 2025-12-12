import React from "react";

export default function LevelCompleteModal({ islandId, mistakes, onContinue }) {
  const getMessage = () => {
    if (mistakes === 0) {
      return "Отлично! Ты справился без ошибок! 🎉";
    } else if (mistakes === 1) {
      return "Хорошая работа! Ты почти идеален! ⭐";
    } else if (mistakes === 2) {
      return "Неплохо! Продолжай в том же духе! 💪";
    } else {
      return "Ты справился! Продолжай учиться! 🌟";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-3xl text-center shadow-xl w-11/12 max-w-md animate-fadeIn">
        <h2 className="text-3xl font-bold text-emerald-700 mb-3">
          🎉 Уровень пройден!
        </h2>

        <p className="text-lg mb-2">
          {getMessage()}
        </p>

        {islandId && (
          <p className="text-base text-gray-600 mb-4">
            Остров {islandId} завершен!
          </p>
        )}

        <button
          onClick={onContinue}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl text-lg transition-colors"
        >
          Далее
        </button>
      </div>
    </div>
  );
}

