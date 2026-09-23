import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SkipperMessage, SkipperSession, SkipperQuickPrompt, GroupedConversations } from '../types/skipper';
import { SkipperService, SKIPPER_QUICK_PROMPTS } from '../services/skipper/skipper.service';

export function useSkipper() {
  const [sessions, setSessions] = useState<SkipperSession[]>(() => {
    return SkipperService.loadSessions();
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const loaded = SkipperService.loadSessions();
    return loaded[0]?.id || `conv_${Date.now()}`;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pipelineStage, setPipelineStage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMessageForInspection, setSelectedMessageForInspection] = useState<SkipperMessage | null>(null);
  const [rightPanelOpen, setRightPanelOpen] = useState<boolean>(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState<boolean>(true);

  // Active session object
  const activeSession = useMemo(() => {
    const found = sessions.find((s) => s.id === activeSessionId);
    if (found) return found;
    if (sessions.length > 0) return sessions[0];
    return SkipperService.createNewSession();
  }, [sessions, activeSessionId]);

  // Persist sessions to localStorage whenever they change
  useEffect(() => {
    SkipperService.saveSessions(sessions);
  }, [sessions]);

  // Initial backend sync on mount
  useEffect(() => {
    let isMounted = true;
    SkipperService.fetchBackendConversations().then((backendConvs) => {
      if (!isMounted || !backendConvs || backendConvs.length === 0) return;

      setSessions((prev) => {
        const prevMap = new Map(prev.map((s) => [s.id, s]));
        const merged: SkipperSession[] = [];

        // Incorporate backend conversations, keeping any cached messages in memory
        backendConvs.forEach((bConv) => {
          const existing = prevMap.get(bConv.id);
          if (existing && existing.messages.length > 0) {
            merged.push(existing);
          } else {
            merged.push(bConv);
          }
          prevMap.delete(bConv.id);
        });

        // Add any remaining local sessions that weren't yet on backend
        prevMap.forEach((s) => merged.push(s));

        merged.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        return merged;
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Switch session & load full messages if not yet in memory
  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    setSelectedMessageForInspection(null);

    // Check if session messages need fetching from backend
    setSessions((prev) => {
      const target = prev.find((s) => s.id === sessionId);
      if (target && target.messages.length === 0) {
        // Fetch async
        SkipperService.fetchBackendConversation(sessionId).then((fullConv) => {
          if (fullConv && fullConv.messages.length > 0) {
            setSessions((curr) =>
              curr.map((s) => (s.id === sessionId ? { ...s, messages: fullConv.messages } : s))
            );
          }
        });
      }
      return prev;
    });
  }, []);

  // Create new consultation session (GUARANTEED CLEAN EMPTY SLATE)
  const createNewConsultation = useCallback(() => {
    const newSession = SkipperService.createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setSelectedMessageForInspection(null);
  }, []);

  // Rename a session
  const renameSession = useCallback((sessionId: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          title: trimmed,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    SkipperService.syncRenameToBackend(sessionId, trimmed).catch(() => {});
  }, []);

  // Delete session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fresh = SkipperService.createNewSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      // If the deleted session was active, switch to first remaining
      if (sessionId === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });

    SkipperService.syncDeleteToBackend(sessionId).catch(() => {});
  }, [activeSessionId]);

  // Filter sessions by search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, searchQuery]);

  // Chronological grouping
  const groupedSessions: GroupedConversations = useMemo(() => {
    return SkipperService.groupConversationsByDate(filteredSessions);
  }, [filteredSessions]);

  // Ask question in active session
  const askQuestion = useCallback(
    async (prompt: string) => {
      const trimmedPrompt = prompt.trim();
      if (!trimmedPrompt || isLoading) return;

      const userMsg: SkipperMessage = {
        id: `msg-user-${Date.now()}`,
        role: 'user',
        timestamp: new Date().toISOString(),
        content: trimmedPrompt,
        conversation_id: activeSessionId,
        message_order: activeSession.messages.length,
      };

      // Immediately append user message
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== activeSessionId) return session;
          return {
            ...session,
            messages: [...session.messages, userMsg],
            updatedAt: new Date().toISOString(),
          };
        })
      );

      // Save user message to backend
      SkipperService.syncMessageToBackend(activeSessionId, userMsg).catch(() => {});

      setIsLoading(true);
      setPipelineStage('Understanding intent & parsing entities...');

      try {
        const { assistantMessage, updatedContext } = await SkipperService.processQuestion(
          trimmedPrompt,
          activeSession.contextEntities,
          (stage) => setPipelineStage(stage)
        );

        assistantMessage.conversation_id = activeSessionId;
        assistantMessage.message_order = activeSession.messages.length + 1;

        // Auto-title if this is the first interaction in this consultation
        const isFirstInteraction = activeSession.messages.length === 0;
        const autoTitle = isFirstInteraction
          ? SkipperService.generateTitle(trimmedPrompt, assistantMessage.parsedIntent)
          : activeSession.title;

        setSessions((prev) =>
          prev.map((session) => {
            if (session.id !== activeSessionId) return session;
            return {
              ...session,
              title: autoTitle,
              messages: [...session.messages, assistantMessage],
              contextEntities: updatedContext,
              updatedAt: new Date().toISOString(),
            };
          })
        );

        // Sync assistant message and title to backend
        SkipperService.syncMessageToBackend(activeSessionId, assistantMessage).catch(() => {});
        if (isFirstInteraction) {
          SkipperService.syncRenameToBackend(activeSessionId, autoTitle).catch(() => {});
        }

        // Auto-select latest assistant message for inspection if panel is open
        setSelectedMessageForInspection(assistantMessage);
      } catch (err) {
        console.error('Skipper execution failure:', err);
        const errorMsg: SkipperMessage = {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toISOString(),
          content: `An operational timeout occurred while querying the maritime ledger. Please re-check your query parameters.`,
          conversation_id: activeSessionId,
          message_order: activeSession.messages.length + 1,
          grounding: {
            status: 'DATA_UNAVAILABLE',
            datasetName: 'Platform Service Gateway',
            sourceCitation: 'Internal Gateway Timeout',
            timestamp: new Date().toISOString(),
            recordCount: 0,
            parametersUsed: { prompt: trimmedPrompt },
            isSimulated: false,
          },
          suggestedFollowUps: [
            'What is the spot rate for TD3C?',
            'Where is vessel APOLLO GLORY?',
            'Show port congestion in Singapore',
          ],
        };

        setSessions((prev) =>
          prev.map((session) => {
            if (session.id !== activeSessionId) return session;
            return {
              ...session,
              messages: [...session.messages, errorMsg],
              updatedAt: new Date().toISOString(),
            };
          })
        );
        SkipperService.syncMessageToBackend(activeSessionId, errorMsg).catch(() => {});
      } finally {
        setIsLoading(false);
        setPipelineStage(null);
      }
    },
    [activeSessionId, activeSession.contextEntities, activeSession.messages.length, activeSession.title, isLoading]
  );

  // Dispatch quick prompt
  const dispatchQuickPrompt = useCallback(
    (quickPrompt: SkipperQuickPrompt) => {
      askQuestion(quickPrompt.prompt);
    },
    [askQuestion]
  );

  // Inspect message
  const inspectMessage = useCallback((msg: SkipperMessage) => {
    setSelectedMessageForInspection(msg);
    setRightPanelOpen(true);
  }, []);

  return {
    sessions,
    filteredSessions,
    groupedSessions,
    activeSession,
    activeSessionId,
    searchQuery,
    setSearchQuery,
    selectSession,
    createNewConsultation,
    renameSession,
    deleteSession,
    askQuestion,
    dispatchQuickPrompt,
    quickPrompts: SKIPPER_QUICK_PROMPTS,
    isLoading,
    pipelineStage,
    selectedMessageForInspection,
    inspectMessage,
    setSelectedMessageForInspection,
    rightPanelOpen,
    setRightPanelOpen,
    leftPanelOpen,
    setLeftPanelOpen,
  };
}
