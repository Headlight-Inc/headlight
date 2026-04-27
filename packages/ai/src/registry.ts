import type { Prompt } from './types';

class PromptRegistry {
  private prompts = new Map<string, Prompt<unknown, unknown>>();

  register<In, Out>(prompt: Prompt<In, Out>) {
    if (this.prompts.has(prompt.id)) {
      throw new Error(`Prompt already registered: ${prompt.id}`);
    }
    this.prompts.set(prompt.id, prompt as Prompt<unknown, unknown>);
  }

  get<In, Out>(id: string): Prompt<In, Out> | undefined {
    return this.prompts.get(id) as Prompt<In, Out> | undefined;
  }

  list(): string[] {
    return [...this.prompts.keys()].sort();
  }
}

export const promptRegistry = new PromptRegistry();
