"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "What does high cholesterol mean?",
  "How can I improve my hemoglobin levels?",
  "What is a healthy blood pressure range?",
  "Explain my recent blood test results",
  "Tips for managing diabetes",
  "What foods are good for heart health?",
];

const mockResponses: Record<string, string> = {
  default: "I understand your concern. As your AI health assistant, I'm here to help you understand your health better. Could you please provide more details about your question so I can give you more specific information?",
  fever: "Fever is your body's natural response to fighting infection. Here's what you should know:\n\n**When to treat fever at home:**\n- Temperature below 103°F (39.4°C)\n- No severe symptoms\n- Able to stay hydrated\n\n**Home care:**\n- Rest and stay hydrated (water, clear fluids)\n- Take acetaminophen (Tylenol) or ibuprofen (Advil)\n- Use cool compresses on forehead\n- Wear light clothing\n- Keep room temperature comfortable\n\n**Seek immediate medical care if:**\n- Fever above 103°F (39.4°C)\n- Fever lasts more than 3 days\n- Severe headache, stiff neck, or confusion\n- Difficulty breathing\n- Persistent vomiting\n- Rash appears\n- Chest pain\n\n**For children:** Seek care if fever is above 100.4°F in infants under 3 months.\n\nStay hydrated and monitor your symptoms closely!",
  cholesterol: "High cholesterol means you have elevated levels of cholesterol in your blood, particularly LDL (bad) cholesterol. Total cholesterol above 200 mg/dL is considered borderline high, and above 240 mg/dL is high. High cholesterol increases your risk of heart disease and stroke.\n\n**To lower cholesterol:**\n- Eat heart-healthy foods (fruits, vegetables, whole grains)\n- Exercise regularly (at least 30 minutes daily)\n- Quit smoking if applicable\n- Limit saturated fats and trans fats\n- Consider omega-3 fatty acids\n\nIf lifestyle changes aren't enough, your doctor may recommend medication like statins.",
  hemoglobin: "Hemoglobin is a protein in red blood cells that carries oxygen. Low hemoglobin (anemia) can cause fatigue, weakness, and shortness of breath.\n\n**Normal ranges:**\n- Men: 13.5-17.5 g/dL\n- Women: 12.0-15.5 g/dL\n\n**To improve hemoglobin:**\n- Eat iron-rich foods (red meat, spinach, beans)\n- Include vitamin C to enhance iron absorption\n- Consider iron supplements (consult doctor first)\n- Eat folate-rich foods (leafy greens, fortified cereals)\n- Avoid calcium with iron-rich meals (inhibits absorption)\n\nIf your levels are significantly low, please consult your doctor.",
  "blood pressure": "Blood pressure is measured in two numbers: systolic (top) and diastolic (bottom).\n\n**Categories:**\n- **Normal:** Less than 120/80 mmHg\n- **Elevated:** 120-129/less than 80\n- **High Stage 1:** 130-139/80-89\n- **High Stage 2:** 140+/90+\n- **Crisis:** Above 180/120 (seek immediate care)\n\n**To maintain healthy BP:**\n- Reduce sodium intake\n- Exercise regularly\n- Maintain healthy weight\n- Limit alcohol\n- Manage stress\n- Don't smoke",
  diabetes: "Diabetes management involves controlling blood sugar levels to prevent complications.\n\n**Key strategies:**\n\n1. **Monitor blood glucose** regularly as advised by your doctor\n\n2. **Healthy eating:**\n   - Focus on complex carbs (whole grains)\n   - Plenty of vegetables\n   - Lean proteins\n   - Limit sugar and processed foods\n\n3. **Regular exercise:** Aim for 150 minutes/week of moderate activity\n\n4. **Take medications** as prescribed\n\n5. **Regular checkups:** HbA1c tests every 3-6 months\n\n6. **Foot care:** Check daily for cuts or sores\n\n**Target levels:**\n- Fasting blood sugar: 80-130 mg/dL\n- 2 hours after meals: Less than 180 mg/dL\n- HbA1c: Less than 7%",
  heart: "Heart-healthy foods can help lower cholesterol, reduce blood pressure, and decrease heart disease risk.\n\n**Best foods for heart health:**\n\n1. **Fatty fish** (salmon, mackerel, sardines) - Rich in omega-3s\n\n2. **Nuts and seeds** - Almonds, walnuts, flaxseeds\n\n3. **Whole grains** - Oats, quinoa, brown rice\n\n4. **Leafy greens** - Spinach, kale, collard greens\n\n5. **Berries** - Blueberries, strawberries (antioxidants)\n\n6. **Avocados** - Healthy monounsaturated fats\n\n7. **Olive oil** - Extra virgin for cooking\n\n8. **Legumes** - Beans, lentils, chickpeas\n\n**Foods to limit:**\n- Processed meats\n- Sugary drinks\n- Trans fats\n- Excessive salt\n- Refined carbs",
  results: "I'd be happy to help explain your blood test results! To give you accurate information, I'll analyze the values you share.\n\n**Common blood test markers:**\n\n- **Complete Blood Count (CBC):** Measures red/white blood cells, hemoglobin, platelets\n- **Lipid Panel:** Cholesterol (total, LDL, HDL) and triglycerides\n- **Metabolic Panel:** Blood sugar, kidney function, electrolytes\n- **Liver Function:** ALT, AST, bilirubin\n- **Thyroid:** TSH, T3, T4\n\nPlease share specific values and I'll explain what they mean, whether they're in normal range, and any recommendations!",
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI Health Assistant. I can help you understand medical terms, explain your test results, answer health questions, and provide general wellness advice. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };
        
        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);
  
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };
  
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  
  const getResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("fever") || lowerMessage.includes("temperature") || lowerMessage.includes("hot")) {
      return mockResponses.fever;
    } else if (lowerMessage.includes("cholesterol")) {
      return mockResponses.cholesterol;
    } else if (lowerMessage.includes("hemoglobin") || lowerMessage.includes("anemia") || lowerMessage.includes("iron")) {
      return mockResponses.hemoglobin;
    } else if (lowerMessage.includes("blood pressure") || lowerMessage.includes("bp") || lowerMessage.includes("hypertension")) {
      return mockResponses["blood pressure"];
    } else if (lowerMessage.includes("diabetes") || lowerMessage.includes("sugar") || lowerMessage.includes("glucose")) {
      return mockResponses.diabetes;
    } else if (lowerMessage.includes("heart") || lowerMessage.includes("cardiac") || lowerMessage.includes("cardiovascular")) {
      return mockResponses.heart;
    } else if (lowerMessage.includes("result") || lowerMessage.includes("report") || lowerMessage.includes("test")) {
      return mockResponses.results;
    }
    
    return mockResponses.default;
  };
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || getResponse(userMessage.content),
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      speakText(assistantMessage.content);
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getResponse(userMessage.content),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <h1 className="text-3xl font-bold text-foreground">AI Medical Chatbot</h1>
        <p className="text-muted-foreground mt-1">
          Ask health questions, get explanations, and receive wellness advice
        </p>
      </motion.div>
      
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-border overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      message.role === "assistant"
                        ? "bg-[#0066FF]"
                        : "bg-secondary"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-foreground" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl ${
                      message.role === "assistant"
                        ? "bg-secondary text-foreground"
                        : "bg-[#0066FF] text-white"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content.split('\n').map((line, i) => (
                        <span key={i}>
                          {line.startsWith('**') && line.endsWith('**') ? (
                            <strong>{line.replace(/\*\*/g, '')}</strong>
                          ) : line.startsWith('- ') ? (
                            <span className="block ml-2">{line}</span>
                          ) : (
                            line
                          )}
                          {i < message.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                    <div className={`text-xs mt-2 ${message.role === "assistant" ? "text-muted-foreground" : "text-white/70"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary">
                    <div className="flex items-center gap-1">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-[#0066FF]"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-[#0066FF]"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-[#0066FF]"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-3">
              <Button
                onClick={toggleListening}
                className={`h-12 px-4 rounded-xl ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-secondary hover:bg-secondary/80 text-foreground'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={isListening ? "Listening..." : "Ask a health question..."}
                className="flex-1 h-12 rounded-xl"
                disabled={isTyping || isListening}
              />
              {isSpeaking && (
                <Button
                  onClick={stopSpeaking}
                  className="h-12 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                  title="Stop speaking"
                >
                  <Volume2 className="w-5 h-5" />
                </Button>
              )}
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="h-12 px-6 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-xl"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Suggested Questions Sidebar */}
        <motion.div
          className="w-80 bg-white rounded-2xl border border-border p-6 hidden lg:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#0066FF]" />
            <h3 className="font-semibold text-foreground">Suggested Questions</h3>
          </div>
          <div className="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <motion.button
                key={question}
                className="w-full p-3 rounded-xl text-left text-sm text-muted-foreground hover:bg-[#0066FF]/5 hover:text-[#0066FF] transition-colors border border-transparent hover:border-[#0066FF]/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </motion.button>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-[#0066FF]/5 border border-[#0066FF]/10">
            <h4 className="font-medium text-foreground text-sm mb-2">About this AI</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This AI assistant provides general health information and education. It is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
