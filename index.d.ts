export type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh";
export type AuthMode = "oauth" | "api-key";
export type AuthSource = "runtime" | "api_key" | "oauth" | "env" | "fallback" | "none";

export type ModelInfo = { provider: string; id: string };

export type SmallModelInfo = { provider: string; id: string; thinkingLevel: ThinkingLevel };

export type SelectedSmallModel = {
  model: ModelInfo;
  thinkingLevel: ThinkingLevel;
  authMode: AuthMode;
  authSource: AuthSource;
  reason: string;
};

export type ModelRegistryLike = {
  getAvailable(): ModelInfo[];
  isUsingOAuth?(model: ModelInfo): boolean;
  getAuthSource?(provider: string): AuthSource;
};

export declare function getSmallModelFromProvider(
  modelRegistry: ModelRegistryLike,
  currentModel: ModelInfo | undefined,
): SelectedSmallModel | null;
