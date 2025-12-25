import { useState } from 'react';
import AncientLoveGame from './AncientLoveGame';
import SurvivalGame from './SurvivalGame';
import { Sparkles, Snowflake, ArrowRight } from 'lucide-react';

function App() {
  const [selectedGame, setSelectedGame] = useState(null);

  if (selectedGame === 'ancient') {
    return (
      <div className="relative">
        <button
          onClick={() => setSelectedGame(null)}
          className="fixed top-4 left-4 z-50 px-3 py-1 bg-black/50 text-white rounded-full text-xs hover:bg-black/70 transition-colors"
        >
          ← 返回主页
        </button>
        <AncientLoveGame />
      </div>
    );
  }

  if (selectedGame === 'survival') {
    return (
      <div className="relative">
        <button
          onClick={() => setSelectedGame(null)}
          className="fixed top-4 left-4 z-50 px-3 py-1 bg-black/50 text-white rounded-full text-xs hover:bg-black/70 transition-colors"
        >
          ← 返回主页
        </button>
        <SurvivalGame />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-screen-dynamic bg-stone-950 flex items-center justify-center p-4 font-serif safe-area-all">
      <div className="max-w-5xl w-full">
        <h1 className="text-3xl md:text-4xl lg:text-5xl text-center text-stone-200 mb-8 md:mb-12 font-bold tracking-wider">
          选择你的命运
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
          {/* Ancient Game Card */}
          <div
            onClick={() => setSelectedGame('ancient')}
            className="group relative h-[350px] sm:h-[400px] md:h-[500px] rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-rose-900/20 border border-stone-800"
          >
            <div className="absolute inset-0 bg-stone-900">
              <img
                src="/bg_banquet.png"
                alt="Ancient"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
            </div>

            <div className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end">
              <div className="mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-2 text-rose-400 mb-2">
                  <Sparkles size={20} />
                  <span className="text-sm tracking-widest uppercase">古风宫廷恋爱 RPG</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-100 mb-2">凤鸣九霄</h2>
                <p className="text-stone-400 line-clamp-3 group-hover:text-stone-300 transition-colors">
                  扮演前朝名将之女，在危机四伏的后宫中寻找真相、伺机复仇。五位性格迥异的男主，十种不同结局，你的选择将决定命运的走向。
                </p>
              </div>

              <div className="flex items-center text-rose-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <span>进入故事</span>
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Survival Game Card */}
          <div
            onClick={() => setSelectedGame('survival')}
            className="group relative h-[350px] sm:h-[400px] md:h-[500px] rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-900/20 border border-stone-800"
          >
            <div className="absolute inset-0 bg-slate-950">
              <img
                src="/bg_snowfield.png"
                alt="Survival"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 group-hover:scale-110 grayscale-[30%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
            </div>

            <div className="absolute inset-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end">
              <div className="mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-center gap-2 text-cyan-400 mb-2">
                  <Snowflake size={20} />
                  <span className="text-sm tracking-widest uppercase">末日生存乙女冒险</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">冰封之心</h2>
                <p className="text-slate-400 line-clamp-3 group-hover:text-slate-300 transition-colors">
                  2027年极端寒潮席卷全球。作为气象研究员，你必须带领幸存者在零下60度的世界中求生。生存还是毁灭，爱恋还是背叛？
                </p>
              </div>

              <div className="flex items-center text-cyan-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <span>开始求生</span>
                <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
