'use client';

import { useState, useRef, useEffect } from 'react';
import { useUIStore, usePracticeStore, useSessionStore } from '@/lib/store';
import { useUsageStore } from '@/lib/usage';
import { Persona, OutcomeType } from '@/lib/types';
import { generatePersona, generateOpeners } from '@/lib/persona';
import { Paywall } from './Paywall';

export function PracticeModal() {
  const { selectedLocation, isPracticeModalOpen, closePracticeModal } = useUIStore();
  const { currentPractice, startPractice, addMessage, endPractice } = usePracticeStore();
  const { addSession } = useSessionStore();
  const {
    plan,
    startSession: trackStartSession,
    addMessage: trackAddMessage,
    canStartSession,
    canSendMessage,
    getRemainingMessages,
    getRemainingSessions
  } = useUsageStore();

  const [persona, setPersona] = useState<Persona | null>(null);
  const [openers, setOpeners] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [showPaywall, setShowPaywall] = useState<'sessions' | 'messages' | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Generate persona when modal opens
  useEffect(() => {
    if (isPracticeModalOpen && selectedLocation && !currentPractice) {
      const newPersona = generatePersona(selectedLocation);
      setPersona(newPersona);
      setOpeners(generateOpeners(selectedLocation.category, newPersona));
    }
  }, [isPracticeModalOpen, selectedLocation, currentPractice]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentPractice?.messages]);

  const handleStartPractice = () => {
    if (!selectedLocation || !persona) return;

    // Check if user can start a session
    if (!canStartSession()) {
      setShowPaywall('sessions');
      return;
    }

    // Track the session start
    trackStartSession();
    startPractice(selectedLocation, persona);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading || !currentPractice) return;

    // Check if user can send a message
    if (!canSendMessage()) {
      setShowPaywall('messages');
      return;
    }

    const message = userInput.trim();
    setUserInput('');

    // Track the message
    trackAddMessage();

    addMessage({ role: 'user', content: message });
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...currentPractice.messages, { role: 'user', content: message }],
          persona: currentPractice.persona,
          location: currentPractice.location,
        }),
      });

      const data = await response.json();
      addMessage({ role: 'assistant', content: data.response });
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: "Sorry, I couldn't respond right now. Try again?",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseOpener = (opener: string) => {
    handleStartPractice();
    setUserInput(opener);
  };

  const handleEndPractice = (outcome: OutcomeType) => {
    if (!currentPractice || !selectedLocation) return;

    endPractice(outcome);
    addSession({
      userId: 'local',
      locationId: selectedLocation.id,
      locationName: selectedLocation.name,
      outcome,
      personaName: currentPractice.persona.name,
    });

    setShowOutcome(false);
    setPersona(null);
    closePracticeModal();
  };

  const handleClose = () => {
    if (currentPractice) {
      setShowOutcome(true);
    } else {
      setPersona(null);
      closePracticeModal();
    }
  };

  if (!isPracticeModalOpen || !selectedLocation) return null;

  const remainingMessages = getRemainingMessages();
  const remainingSessions = getRemainingSessions();

  return (
    <>
      {showPaywall && (
        <Paywall type={showPaywall} onClose={() => setShowPaywall(null)} />
      )}

      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
        <div className="w-full max-w-[520px] h-[90vh] max-h-[800px] bg-[#0d0d15] border border-primary/20 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Persona Card */}
        {persona && (
          <div className="p-5 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-white/[0.08] relative">
            <button
              onClick={handleClose}
              className="absolute top-3 right-4 w-8 h-8 rounded-full bg-white/[0.08] border border-white/15 text-gray-400 hover:bg-primary/30 hover:text-white transition-all flex items-center justify-center"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl flex-shrink-0">
                {persona.emoji}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{persona.name}</h3>
                <p className="text-[12px] text-primary-light">{persona.occupation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300">
              <span>
                <span className="text-gray-500">Age:</span> {persona.age}
              </span>
              <span>
                <span className="text-gray-500">Vibe:</span> {persona.vibe}
              </span>
              <span className="col-span-2">
                <span className="text-gray-500">Interests:</span> {persona.interests.join(', ')}
              </span>
            </div>

            <p className="mt-2 text-[11px] text-gray-500 pt-2 border-t border-white/[0.06]">
              📍 {selectedLocation.name}
            </p>

            <p className="mt-2 text-[12px] text-accent/80 italic leading-relaxed">
              {persona.scenario}
            </p>
          </div>
        )}

        {/* Chat / Opener Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {!currentPractice ? (
            <>
              <p className="text-[12px] text-gray-500 text-center py-2">
                Choose an opener or write your own to start practicing
              </p>

              {/* Opener Suggestions */}
              <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.08]">
                <h4 className="text-[11px] text-primary-light uppercase tracking-wide mb-3">
                  Suggested Openers
                </h4>
                <div className="flex flex-col gap-2">
                  {openers.map((opener, i) => (
                    <div
                      key={i}
                      onClick={() => handleUseOpener(opener)}
                      className="p-3 bg-white/[0.05] rounded-lg text-[12px] text-gray-300 cursor-pointer hover:bg-primary/15 hover:text-white transition-all border-l-2 border-transparent hover:border-primary"
                    >
                      {opener}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartPractice}
                className="btn-primary mt-4 py-3 text-[13px]"
              >
                Start Practice Session
              </button>
            </>
          ) : (
            <>
              {/* Chat Messages */}
              {currentPractice.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[85%] p-3 rounded-xl text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'ml-auto bg-gradient-to-r from-primary to-accent text-white'
                      : 'mr-auto bg-white/[0.08] text-gray-200'
                  }`}
                >
                  {msg.content}
                </div>
              ))}

              {isLoading && (
                <div className="mr-auto bg-white/[0.08] text-gray-400 p-3 rounded-xl text-[13px]">
                  <span className="animate-pulse">typing...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Input Area (only when practicing) */}
        {currentPractice && !showOutcome && (
          <div className="p-4 border-t border-white/[0.08]">
            {/* Usage indicator for free users */}
            {plan === 'free' && remainingMessages !== Infinity && (
              <div className="mb-2 flex items-center justify-between text-[11px]">
                <span className="text-gray-500">
                  {remainingMessages} messages left this session
                </span>
                {remainingMessages <= 3 && (
                  <button
                    onClick={() => setShowPaywall('messages')}
                    className="text-primary hover:underline"
                  >
                    Upgrade for unlimited
                  </button>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-[13px]"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !userInput.trim()}
                className="btn-primary px-5 disabled:opacity-50"
              >
                Send
              </button>
            </div>

            {/* End Session Button */}
            <button
              onClick={() => setShowOutcome(true)}
              className="w-full mt-3 py-2 text-[11px] text-gray-500 hover:text-primary transition-colors"
            >
              End Practice & Log Outcome
            </button>
          </div>
        )}

        {/* Outcome Selection */}
        {showOutcome && (
          <div className="p-4 border-t border-white/[0.08]">
            <p className="text-[12px] text-gray-400 text-center mb-3">How did it go?</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleEndPractice('success')}
                className="py-3 rounded-lg font-semibold text-[12px] outcome-success hover:scale-105 transition-transform"
              >
                ✓ Success
              </button>
              <button
                onClick={() => handleEndPractice('neutral')}
                className="py-3 rounded-lg font-semibold text-[12px] outcome-neutral hover:scale-105 transition-transform"
              >
                ~ Neutral
              </button>
              <button
                onClick={() => handleEndPractice('reject')}
                className="py-3 rounded-lg font-semibold text-[12px] outcome-reject hover:scale-105 transition-transform"
              >
                ✗ Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
