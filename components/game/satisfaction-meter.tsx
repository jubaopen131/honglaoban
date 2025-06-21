import { Progress } from "@/components/ui/progress"

interface SatisfactionMeterProps {
  score: number
  turnsLeft: number
}

export const SatisfactionMeter = ({ score, turnsLeft }: SatisfactionMeterProps) => {
  const progressValue = Math.max(0, Math.min(100, score))
  let progressColorClass = "bg-brand-primary"
  if (score < 30) progressColorClass = "bg-red-500"
  else if (score < 70) progressColorClass = "bg-yellow-500"

  return (
    <div className="w-full p-4 bg-white shadow-md rounded-lg mb-4 sticky top-0 z-10">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-brand-text">老板满意度</h2>
        <span className="text-sm text-gray-600">剩余回合: {turnsLeft}</span>
      </div>
      <Progress
        value={progressValue}
        className="w-full h-4 [&>*]:transition-all [&>*]:duration-500"
        indicatorClassName={progressColorClass}
      />
      <p className="text-right mt-1 text-xl font-bold text-brand-text">{score} / 100</p>
    </div>
  )
}
