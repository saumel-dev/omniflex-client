'use client'
import { useState } from "react";
import { FiActivity, FiZap } from "react-icons/fi";

export default function MacroCalculatorForm() {
  const [weight, setWeight] = useState(70);
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("muscle");
  const [results, setResults] = useState(null);

  const calculateMacros = (e) => {
    e.preventDefault();

    // 1. Calculate Baseline Calories (Mifflin-St Jeor simplified representation)
    let baseCalories = weight * 24;

    // 2. Activity Multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      moderate: 1.5,
      heavy: 1.8,
    };
    let tdee = baseCalories * activityMultipliers[activity];

    // 3. Adjust Calories based on physical fitness goals
    let targetCalories = tdee;
    let proteinPct = 0.30, carbPct = 0.40, fatPct = 0.30;

    if (goal === "fat") {
      targetCalories = tdee - 500;
      proteinPct = 0.40; // High protein during deficit
      carbPct = 0.35;
      fatPct = 0.25;
    } else if (goal === "muscle") {
      targetCalories = tdee + 350;
      proteinPct = 0.30;
      carbPct = 0.50; // Higher carbs for intense lifting fuel
      fatPct = 0.20;
    }

    // Ensure calories don't drop to dangerous numbers
    const totalCalories = Math.max(Math.round(targetCalories), 1200);

    // 4. Gram Conversions (Protein: 4cal/g, Carbs: 4cal/g, Fat: 9cal/g)
    const proteinGrams = Math.round((totalCalories * proteinPct) / 4);
    const carbGrams = Math.round((totalCalories * carbPct) / 4);
    const fatGrams = Math.round((totalCalories * fatPct) / 9);

    setResults({
      calories: totalCalories,
      protein: proteinGrams,
      carbs: carbGrams,
      fat: fatGrams,
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={calculateMacros} className="space-y-5">
        {/* Weight Range Slider Input */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-default-700 dark:text-zinc-300">Your Weight</label>
            <span className="text-sm font-bold text-[#FF6B00]">{weight} kg</span>
          </div>
          <input 
            type="range" 
            min="40" 
            max="150" 
            value={weight} 
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-full accent-[#FF6B00] bg-default-200 dark:bg-zinc-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Activity Selector Grid Layout */}
        <div>
          <label className="block text-sm font-medium text-default-700 dark:text-zinc-300 mb-2">Weekly Activity Level</label>
          <select 
            value={activity} 
            onChange={(e) => setActivity(e.target.value)}
            className="w-full p-3 rounded-xl border border-default-300 dark:border-zinc-800 bg-background text-foreground text-sm focus:outline-none focus:border-[#FF6B00] transition-colors"
          >
            <option value="sedentary">Sedentary (Desk job, minimal activity)</option>
            <option value="moderate">Moderate Training (3-4 times/week)</option>
            <option value="heavy">Heavy Athletics (Elite / Daily lifting)</option>
          </select>
        </div>

        {/* Target Goals Selector */}
        <div>
          <label className="block text-sm font-medium text-default-700 dark:text-zinc-300 mb-2">Your Training Goal</label>
          <select 
            value={goal} 
            onChange={(e) => setGoal(e.target.value)}
            className="w-full p-3 rounded-xl border border-default-300 dark:border-zinc-800 bg-background text-foreground text-sm focus:outline-none focus:border-[#FF6B00] transition-colors"
          >
            <option value="fat">Fat Loss & Definition</option>
            <option value="maintain">Maintenance & Recovery Optimization</option>
            <option value="muscle">Hypertrophy & Muscle Synthesis</option>
          </select>
        </div>

        <button 
          type="submit"
          className="w-full bg-[#FF6B00] text-white font-bold p-3.5 rounded-xl cursor-pointer hover:bg-[#E56000] active:scale-[0.99] transition-all duration-200 shadow-md shadow-[#FF6B00]/10"
        >
          Generate Personal Blueprint
        </button>
      </form>

      {/* RENDER DYNAMIC RESULTS SCREEN */}
      {results && (
        <div className="pt-6 border-t border-default-200 dark:border-zinc-800 space-y-5 transition-all duration-500 animate-fadeIn">
          <div className="flex justify-between items-center bg-[#FF6B00]/5 border border-[#FF6B00]/20 p-4 rounded-xl">
            <span className="text-sm font-medium text-default-600 dark:text-zinc-400">Target Daily Intake</span>
            <span className="text-xl font-black text-[#FF6B00] flex items-center gap-1">
              <FiZap className="w-5 h-5 fill-current" /> {results.calories} <span className="text-xs font-normal text-default-500">kcal</span>
            </span>
          </div>

          {/* Individual Macro Bars */}
          <div className="space-y-3">
            {/* Protein Track */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-default-700 dark:text-zinc-300">Protein (Muscle Repair)</span>
                <span className="text-[#FF6B00]">{results.protein}g</span>
              </div>
              <div className="w-full bg-default-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#FF6B00] h-full rounded-full transition-all duration-500" style={{ width: '35%' }} />
              </div>
            </div>

            {/* Carbohydrates Track */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-default-700 dark:text-zinc-300">Carbohydrates (Explosive Energy)</span>
                <span className="text-blue-500 dark:text-blue-400">{results.carbs}g</span>
              </div>
              <div className="w-full bg-default-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 dark:bg-blue-400 h-full rounded-full transition-all duration-500" style={{ width: '45%' }} />
              </div>
            </div>

            {/* Fats Track */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-default-700 dark:text-zinc-300">Healthy Fats (Hormonal Balance)</span>
                <span className="text-emerald-500 dark:text-emerald-400">{results.fat}g</span>
              </div>
              <div className="w-full bg-default-200 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}