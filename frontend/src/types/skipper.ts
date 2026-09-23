export type SkipperIntentCategory =
  | 'VESSEL_INTELLIGENCE'
  | 'FREIGHT_MARKET'
  | 'FFA_DERIVATIVES'
  | 'PORT_CONGESTION'
  | 'FLEET_OPERATIONS'
  | 'DECARBONIZATION'
  | 'MULTI_YEAR_EXPLORATION'
  | 'UNKNOWN_OR_AMBIGUOUS';

export type GroundingStatus =
  | 'VERIFIED_LIVE_DATA'
  | 'HISTORICAL_DATA'
  | 'DEMO_SIMULATED_DATA'
  | 'DATA_UNAVAILABLE';

export interface SkipperParsedIntent {
  category: SkipperIntentCategory;
  confidence: number;
  entities: {
    vesselName?: string;
    imo?: string;
    routeCode?: string;
    vesselClass?: string;
    portName?: string;
    commodity?: string;
    timePeriod?: string;
    isComparison?: boolean;
    comparisonTarget?: string;
  };
  timeHorizon?: string;
  originalQuery: string;
}

export interface SkipperTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  format?: 'currency' | 'number' | 'badge' | 'text' | 'date';
}

export interface SkipperTablePayload {
  title: string;
  columns: SkipperTableColumn[];
  rows: Record<string, any>[];
  totalCount: number;
  downloadFilename?: string;
}

export interface SkipperChartPayload {
  type: 'time-series' | 'bar-comparison' | 'curve';
  title: string;
  subtitle?: string;
  xAxisLabel: string;
  yAxisLabel: string;
  dataPoints: {
    label: string;
    value: number;
    secondaryValue?: number;
    category?: string;
  }[];
  unit: string;
  secondaryUnit?: string;
  baseline?: number;
}

export interface SkipperMapPayload {
  title: string;
  vesselName: string;
  imo: string;
  vesselClass: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  heading: number;
  speedKnots: number;
  originPort: string;
  destinationPort: string;
  eta: string;
  routeWaypoints?: { lat: number; lng: number }[];
  status: string;
}

export interface SkipperVisualArtifact {
  type: 'table' | 'chart' | 'map';
  table?: SkipperTablePayload;
  chart?: SkipperChartPayload;
  map?: SkipperMapPayload;
}

export interface SkipperGroundingMetadata {
  status: GroundingStatus;
  datasetName: string;
  sourceCitation: string;
  timestamp: string;
  recordCount: number;
  parametersUsed: Record<string, any>;
  isSimulated: boolean;
  provenanceNotice?: string;
  provenance?: import('./provenance').DataProvenance;
}

export interface SkipperMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  content: string;
  conversation_id?: string;
  message_order?: number;
  parsedIntent?: SkipperParsedIntent;
  grounding?: SkipperGroundingMetadata;
  evidenceRecords?: Record<string, any>[];
  visualArtifact?: SkipperVisualArtifact;
  suggestedFollowUps?: string[];
  pipelineStage?: string;
  isStreaming?: boolean;
}

export interface SkipperSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: SkipperMessage[];
  contextEntities: Record<string, any>;
  messageCount?: number;
  metadata?: Record<string, any>;
}

export type ConversationDateGroup = 'Today' | 'Yesterday' | 'Previous 7 Days' | 'Older';

export interface GroupedConversations {
  Today: SkipperSession[];
  Yesterday: SkipperSession[];
  'Previous 7 Days': SkipperSession[];
  Older: SkipperSession[];
}

export interface SkipperQuickPrompt {
  id: string;
  category: SkipperIntentCategory;
  label: string;
  prompt: string;
  iconName: string;
}

