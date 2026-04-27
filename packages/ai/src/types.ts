export interface Prompt<In, Out> {
  id: string;
  version: string;
  tier: string;
  taskType: string;
  system: string;
  render: (input: In) => string;
  parse: (text: string) => Out;
}
