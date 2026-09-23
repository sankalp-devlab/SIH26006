import type {
  SkipperMessage,
  SkipperSession,
  SkipperQuickPrompt,
  SkipperVisualArtifact,
} from '../../types/skipper';
import { SkipperIntentEngine } from './skipper-intent-engine';
import { SkipperDataRouter } from './skipper-data-router';
import { API_CONFIG } from '../../config/api';

export const SKIPPER_QUICK_PROMPTS: SkipperQuickPrompt[] = [
  {
    id: 'qp-spot-td3c',
    category: 'FREIGHT_MARKET',
    label: 'TD3C Spot Freight Rate',
    prompt: 'What is the current spot freight rate for VLCC Middle East to China (TD3C)?',
    iconName: 'TrendingUp',
  },
  {
    id: 'qp-ffa-curve',
    category: 'FFA_DERIVATIVES',
    label: 'Forward FFA Freight Curve',
    prompt: 'Show the forward freight agreement (FFA) curve for TD3C and tell me if it is in contango.',
    iconName: 'ShieldCheck',
  },
  {
    id: 'qp-vessel-apollo',
    category: 'VESSEL_INTELLIGENCE',
    label: 'Track Vessel APOLLO GLORY',
    prompt: 'Where is vessel APOLLO GLORY and what cargo is she carrying?',
    iconName: 'Ship',
  },
  {
    id: 'qp-port-congestion',
    category: 'PORT_CONGESTION',
    label: 'Singapore Port Congestion',
    prompt: 'What is the average vessel wait time and queue at Singapore port?',
    iconName: 'Anchor',
  },
  {
    id: 'qp-fleet-operators',
    category: 'FLEET_OPERATIONS',
    label: 'Global Commercial Fleets',
    prompt: 'Show the breakdown of global commercial fleet operators and carrying capacity.',
    iconName: 'Building2',
  },
  {
    id: 'qp-decarbon-cii',
    category: 'DECARBONIZATION',
    label: 'CII Decarbonization Profile',
    prompt: 'Show CII emissions and speed reduction fuel savings for VLCC class.',
    iconName: 'Leaf',
  },
  {
    id: 'qp-12y-supercycle',
    category: 'MULTI_YEAR_EXPLORATION',
    label: '12-Year Freight Cycles (2014–2026)',
    prompt: 'Show maritime freight rate supercycles across the 12-year dataset from 2014 to 2026.',
    iconName: 'Calendar',
  },
];

const LOCAL_STORAGE_KEY = 'sih26006_skipper_sessions_v2';
const API_BASE = `${API_CONFIG.BASE_URL}/api/chat`;

export class SkipperService {
  /**
   * Generates a concise, high-signal conversation title from the first query and intent
   */
  public static generateTitle(prompt: string, intent?: any): string {
    const cleanPrompt = prompt.trim();
    const lower = cleanPrompt.toLowerCase();

    // Intent/entity based detection
    if (intent?.entities?.routeCode) {
      return `${intent.entities.routeCode.toUpperCase()} Spot Freight Rates`;
    }
    if (intent?.entities?.portName) {
      return `${intent.entities.portName} Port Congestion`;
    }
    if (intent?.entities?.vesselName) {
      return `Track ${intent.entities.vesselName}`;
    }

    // Keyword heuristics
    if (lower.includes('td3c')) return 'TD3C Spot Freight Rates';
    if (lower.includes('singapore')) return 'Singapore Port Congestion';
    if (lower.includes('apollo')) return 'Vessel APOLLO GLORY';
    if (lower.includes('12-year') || lower.includes('cycle') || lower.includes('supercycle')) {
      return '12-Year Freight Cycles';
    }
    if (lower.includes('ffa') || lower.includes('curve') || lower.includes('contango')) {
      return 'Forward FFA Freight Curve';
    }
    if (lower.includes('fleet') || lower.includes('operator')) {
      return 'Global Commercial Fleets';
    }
    if (lower.includes('cii') || lower.includes('emission') || lower.includes('decarbon')) {
      return 'CII Decarbonization Profile';
    }
    if (lower.includes('rotterdam')) return 'Rotterdam Port Inquiries';
    if (lower.includes('cargo') && lower.includes('matching')) return 'Vessel Cargo Matching';

    // Fallback: Strip common question starters and capitalize
    let stripped = cleanPrompt
      .replace(/^(what is the|show me|can you show|where is|tell me about|analyze the|give me the|find the)\s+/i, '')
      .replace(/[?!.]+$/, '')
      .trim();

    if (!stripped) stripped = cleanPrompt;
    if (stripped.length > 36) {
      stripped = stripped.slice(0, 36) + '...';
    }
    return stripped.charAt(0).toUpperCase() + stripped.slice(1);
  }

  /**
   * Processes a user question through the complete 8-stage AI maritime pipeline
   */
  public static async processQuestion(
    prompt: string,
    contextEntities: Record<string, any> = {},
    onStageUpdate?: (stage: string) => void
  ): Promise<{
    assistantMessage: SkipperMessage;
    updatedContext: Record<string, any>;
  }> {
    // Stage 1: Intent Understanding
    onStageUpdate?.('Understanding intent & parsing entities...');
    await new Promise((r) => setTimeout(r, 60));

    const parsedIntent = SkipperIntentEngine.parse(prompt, contextEntities);

    // Stage 2: Data Source Routing
    onStageUpdate?.(`Identifying maritime dataset: ${parsedIntent.category}...`);
    await new Promise((r) => setTimeout(r, 80));

    // Stage 3 & 4: Data Query Execution & Evidence Grounding
    onStageUpdate?.('Querying empirical maritime services & ledger...');
    const result = await SkipperDataRouter.executeQuery(parsedIntent);

    // Stage 5: Intelligence Synthesis & Visual Artifacts
    onStageUpdate?.('Synthesizing answer & generating visual artifacts...');
    await new Promise((r) => setTimeout(r, 60));

    let visualArtifact: SkipperVisualArtifact | undefined;
    if (result.map) {
      visualArtifact = { type: 'map', map: result.map };
    } else if (result.chart) {
      visualArtifact = { type: 'chart', chart: result.chart, table: result.table };
    } else if (result.table) {
      visualArtifact = { type: 'table', table: result.table };
    }

    const assistantMessage: SkipperMessage = {
      id: `msg-asst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role: 'assistant',
      timestamp: new Date().toISOString(),
      content: result.naturalAnswer,
      parsedIntent,
      grounding: result.grounding,
      evidenceRecords: result.evidenceRecords,
      visualArtifact,
      suggestedFollowUps: result.followUps,
    };

    // Update conversation context entities
    const updatedContext: Record<string, any> = {
      ...contextEntities,
      ...parsedIntent.entities,
      lastCategory: parsedIntent.category,
      lastTimestamp: new Date().toISOString(),
    };

    return { assistantMessage, updatedContext };
  }

  /**
   * High-level method to send a message within a session, returning updated session with context
   */
  public static async sendMessage(
    session: SkipperSession,
    prompt: string,
    onStageUpdate?: (stage: string) => void
  ): Promise<SkipperSession> {
    const userMessage: SkipperMessage = {
      id: `msg-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role: 'user',
      timestamp: new Date().toISOString(),
      content: prompt,
      conversation_id: session.id,
      message_order: session.messages.length,
    };

    const { assistantMessage, updatedContext } = await this.processQuestion(
      prompt,
      session.contextEntities || {},
      onStageUpdate
    );

    assistantMessage.conversation_id = session.id;
    assistantMessage.message_order = session.messages.length + 1;

    // Generate smart title on first interaction if title is default
    const isFirstUserMessage = session.messages.filter((m) => m.role === 'user').length === 0;
    const title = isFirstUserMessage
      ? this.generateTitle(prompt, assistantMessage.parsedIntent)
      : session.title;

    const updatedSession: SkipperSession = {
      ...session,
      title,
      messages: [...session.messages, userMessage, assistantMessage],
      contextEntities: updatedContext,
      updatedAt: new Date().toISOString(),
    };

    // Sync to backend asynchronously
    this.syncMessageToBackend(session.id, userMessage).catch(() => {});
    this.syncMessageToBackend(session.id, assistantMessage).catch(() => {});
    if (isFirstUserMessage) {
      this.syncRenameToBackend(session.id, title).catch(() => {});
    }

    return updatedSession;
  }

  /**
   * Creates a fresh, clean conversation session (ZERO LEAKING MESSAGES)
   */
  public static createNewSession(title?: string): SkipperSession {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const session: SkipperSession = {
      id: sessionId,
      title: title || 'New Consultation',
      createdAt: nowIso,
      updatedAt: nowIso,
      messages: [], // Clean empty state!
      contextEntities: {},
    };

    // Register on backend asynchronously
    this.syncCreateToBackend(session).catch(() => {});

    return session;
  }

  /**
   * Group conversations chronologically: Today, Yesterday, Previous 7 Days, Older
   */
  public static groupConversationsByDate(sessions: SkipperSession[]): import('../../types/skipper').GroupedConversations {
    const groups: import('../../types/skipper').GroupedConversations = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: [],
    };

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayMidnight = todayMidnight - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = todayMidnight - 7 * 24 * 60 * 60 * 1000;

    sessions.forEach((s) => {
      const time = new Date(s.updatedAt || s.createdAt).getTime();
      if (time >= todayMidnight) {
        groups.Today.push(s);
      } else if (time >= yesterdayMidnight) {
        groups.Yesterday.push(s);
      } else if (time >= sevenDaysAgo) {
        groups['Previous 7 Days'].push(s);
      } else {
        groups.Older.push(s);
      }
    });

    return groups;
  }

  /**
   * Loads saved sessions from localStorage (with backend reconciliation)
   */
  public static loadSessions(): SkipperSession[] {
    if (typeof window === 'undefined') {
      return [this.createNewSession()];
    }

    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Skipper: Failed to read sessions from localStorage', e);
    }

    const defaultSession = this.createNewSession();
    this.saveSessions([defaultSession]);
    return [defaultSession];
  }

  /**
   * Saves sessions to localStorage
   */
  public static saveSessions(sessions: SkipperSession[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Skipper: Failed to save sessions to localStorage', e);
    }
  }

  // --- Backend API Integration Helpers with Graceful Fallback ---

  public static async fetchBackendConversations(): Promise<SkipperSession[] | null> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE}/conversations`, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.conversations)) {
        return data.conversations.map((c: any) => ({
          id: c.id,
          title: c.title,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          messages: [],
          contextEntities: {},
          messageCount: c.message_count || 0,
        }));
      }
    } catch {
      // Return null to fall back to localStorage
    }
    return null;
  }

  public static async fetchBackendConversation(id: string): Promise<SkipperSession | null> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${API_BASE}/conversations/${id}`, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.status === 'success' && data.conversation) {
        return {
          id: data.conversation.id,
          title: data.conversation.title,
          createdAt: data.conversation.created_at,
          updatedAt: data.conversation.updated_at,
          messages: (data.messages || []).map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.created_at,
            conversation_id: m.conversation_id,
            message_order: m.message_order,
            visualArtifact: m.metadata?.visualArtifact,
            grounding: m.metadata?.grounding,
            suggestedFollowUps: m.metadata?.suggestedFollowUps,
            parsedIntent: m.metadata?.parsedIntent,
          })),
          contextEntities: data.conversation.metadata?.contextEntities || {},
        };
      }
    } catch {
      // Fallback
    }
    return null;
  }

  public static async syncCreateToBackend(session: SkipperSession): Promise<void> {
    try {
      await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.id,
          title: session.title,
          metadata: { contextEntities: session.contextEntities },
        }),
      });
    } catch {
      // Handled via local storage
    }
  }

  public static async syncRenameToBackend(sessionId: string, newTitle: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/conversations/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
    } catch {
      // Handled via local storage
    }
  }

  public static async syncDeleteToBackend(sessionId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/conversations/${sessionId}`, {
        method: 'DELETE',
      });
    } catch {
      // Handled via local storage
    }
  }

  public static async syncMessageToBackend(sessionId: string, msg: SkipperMessage): Promise<void> {
    try {
      await fetch(`${API_BASE}/conversations/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          message_order: msg.message_order || 0,
          metadata: {
            visualArtifact: msg.visualArtifact,
            grounding: msg.grounding,
            suggestedFollowUps: msg.suggestedFollowUps,
            parsedIntent: msg.parsedIntent,
          },
        }),
      });
    } catch {
      // Handled via local storage
    }
  }
}

