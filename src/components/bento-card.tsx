import React from "react";

type BentoCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  testFunction: () => void;
  isLoading: boolean;
};

export function BentoCard({
  title,
  description,
  children,
  testFunction,
  isLoading,
}: BentoCardProps) {
  return (
    <div className="bg-white/5 p-6 rounded-3xl shadow-xl border border-white/10 backdrop-blur-sm flex flex-col gap-4">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-sm text-gray-400 min-h-[40px]">{description}</p>
      <div className="flex-grow">{children}</div>
      <button
        onClick={testFunction}
        className="mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-xl shadow-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? "테스트 중..." : "테스트 실행"}
      </button>
    </div>
  );
}
