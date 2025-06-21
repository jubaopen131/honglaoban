"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChatBubble } from "@/components/game/chat-bubble"
import { SatisfactionMeter } from "@/components/game/satisfaction-meter"
import { scenarios, type Scenario, MAX_TURNS, TARGET_SCORE } from "@/lib/game-config"
import { Loader2, RotateCcw, Home } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

interface Message {
  id: string
  sender: "user" | "boss"
  text: string
}

interface Option {
  text: string
  score: number
}

type GameStatus = "playing" | "won" | "lost" | "error"

export default function GamePage() {
  const router = useRouter()
  const params = useParams()
  const scenarioSlug = params.scenarioSlug as string

  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [options, setOptions] = useState<Option[]>([])
  const [score, setScore] = useState(0)
  const [turn, setTurn] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing")
  const [error, setError] = useState<string | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const initializeGame = useCallback(async (scenario: Scenario) => {
    setIsLoading(true)
    setError(null)
    setMessages([])
    setOptions([])
    setScore(0)
    setTurn(0)
    setGameStatus("playing")

    try {
      // Initial boss statement is from scenario config, then fetch options
      const initialBossMessage: Message = {
        id: `boss-init-${Date.now()}`,
        sender: "boss",
        text: scenario.initialPrompt,
      }
      setMessages([initialBossMessage])

      const response = await fetch("/api/generate-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioTitle: scenario.title,
          scenarioDescription: scenario.description,
          conversationHistory: [{ role: "assistant", content: scenario.initialPrompt }], // API expects this format
          currentScore: 0,
          currentTurn: 0,
          isInitialTurn: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API Error: ${response.statusText}`)
      }

      const data = await response.json()
      // For the initial call, we only need options, the boss statement is already set.
      // If API returns a new boss statement for initial, we can use it or ignore it.
      // Let's assume API returns options based on the initial prompt.
      if (data.options) {
        setOptions(data.options)
      } else if (data.bossStatement && data.options) {
        // If API generates a new initial statement, update it (optional)
        // setMessages([{ id: `boss-init-${Date.now()}`, sender: "boss", text: data.bossStatement }]);
        setOptions(data.options)
      } else {
        throw new Error("Invalid API response for initial turn.")
      }
    } catch (err: any) {
      console.error("Initialization error:", err)
      setError(err.message || "Failed to initialize game.")
      setGameStatus("error")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const scenario = scenarios.find((s) => s.slug === scenarioSlug)
    if (scenario) {
      setCurrentScenario(scenario)
      initializeGame(scenario)
    } else {
      setError("Scenario not found.")
      setGameStatus("error")
    }
  }, [scenarioSlug, initializeGame])

  const handleOptionSelect = async (option: Option) => {
    if (isLoading || gameStatus !== "playing") return

    setIsLoading(true)
    setError(null)

    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: option.text,
    }
    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)
    setOptions([]) // Clear options while loading next set

    const newScore = Math.max(0, Math.min(TARGET_SCORE + 50, score + option.score)) // Allow overshooting 100 a bit
    const newTurn = turn + 1

    setScore(newScore)
    setTurn(newTurn)

    if (newScore >= TARGET_SCORE) {
      setGameStatus("won")
      setIsLoading(false)
      // Add a final congratulatory message from the boss
      const finalBossMessage: Message = {
        id: `boss-win-${Date.now()}`,
        sender: "boss",
        text: "干得漂亮！你小子有前途，明天来我办公室，我们聊聊你的晋升问题！",
      }
      setMessages((prev) => [...prev, finalBossMessage])
      return
    }

    if (newTurn >= MAX_TURNS) {
      setGameStatus("lost")
      setIsLoading(false)
      // Add a final "you're fired" type message
      const finalBossMessage: Message = {
        id: `boss-lose-${Date.now()}`,
        sender: "boss",
        text:
          newScore > 50
            ? "表现还行，但离我的期望还差得远呢！继续努力吧。"
            : "我对你的表现非常失望！明天你不用来了，去财务把工资结一下。",
      }
      setMessages((prev) => [...prev, finalBossMessage])
      return
    }

    // Prepare conversation history for API
    const conversationHistoryForAPI = updatedMessages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }))

    try {
      const response = await fetch("/api/generate-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioTitle: currentScenario?.title,
          scenarioDescription: currentScenario?.description,
          conversationHistory: conversationHistoryForAPI,
          currentScore: newScore,
          currentTurn: newTurn,
          isInitialTurn: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API Error: ${response.statusText}`)
      }
      const data = await response.json()
      if (!data.bossStatement || !data.options) {
        throw new Error("Invalid API response structure.")
      }

      const newBossMessage: Message = {
        id: `boss-${Date.now()}`,
        sender: "boss",
        text: data.bossStatement,
      }
      setMessages((prevMessages) => [...prevMessages, newBossMessage])
      setOptions(data.options)
    } catch (err: any) {
      console.error("API call error:", err)
      setError(err.message || "Failed to get response from boss.")
      // Potentially set gameStatus to 'error' or allow retry
      // For now, let's add the error as a boss message
      const errorBossMessage: Message = {
        id: `boss-error-${Date.now()}`,
        sender: "boss",
        text: `(系统故障，老板暂时失联... 错误: ${err.message})`,
      }
      setMessages((prevMessages) => [...prevMessages, errorBossMessage])
      setOptions([]) // No options if error
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentScenario && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
        <p className="mt-4 text-lg text-gray-600">正在加载场景...</p>
      </div>
    )
  }

  if (error && gameStatus === "error") {
    return (
      <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>发生错误!</AlertTitle>
          <AlertDescription>{error || "加载游戏时出现未知问题。"}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/")} className="mt-6 bg-brand-primary hover:bg-brand-secondary text-white">
          <Home className="mr-2 h-4 w-4" /> 返回首页
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-h-screen w-full max-w-2xl mx-auto bg-gray-50 shadow-2xl">
      {currentScenario && <SatisfactionMeter score={score} turnsLeft={MAX_TURNS - turn} />}

      <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, index) => (
          <ChatBubble key={msg.id} message={msg} animate={index === messages.length - 1} />
        ))}
        <div ref={chatEndRef} /> {/* For scrolling to bottom */}
      </div>

      {isLoading && gameStatus === "playing" && (
        <div className="p-4 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          <p className="ml-2 text-gray-600">老板正在思考...</p>
        </div>
      )}

      {gameStatus === "playing" && !isLoading && options.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <p className="text-sm text-gray-700 mb-3 font-semibold">你打算怎么回复？</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 leading-snug whitespace-normal break-words bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
                onClick={() => handleOptionSelect(opt)}
                disabled={isLoading}
              >
                {opt.text}
              </Button>
            ))}
          </div>
        </div>
      )}

      {(gameStatus === "won" || gameStatus === "lost") && !isLoading && (
        <div className="p-6 border-t border-gray-200 bg-white text-center">
          <h2 className={`text-3xl font-bold mb-3 ${gameStatus === "won" ? "text-green-500" : "text-red-500"}`}>
            {gameStatus === "won" ? "恭喜！你成功哄好了老板！" : "游戏结束！"}
          </h2>
          <p className="text-lg text-gray-700 mb-1">
            最终得分: <span className="font-bold">{score}</span> / {TARGET_SCORE}
          </p>
          <p className="text-md text-gray-600 mb-6">
            {gameStatus === "won"
              ? "看来你深谙职场生存之道！"
              : score > 50
                ? "再接再厉，下次争取让老板更满意！"
                : "看来老板对你不太满意，下次小心点！"}
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => currentScenario && initializeGame(currentScenario)}
              className="bg-brand-primary hover:bg-brand-secondary text-white"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> 再试一次 ({currentScenario?.title})
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
            >
              <Home className="mr-2 h-4 w-4" /> 选择其他场景
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
