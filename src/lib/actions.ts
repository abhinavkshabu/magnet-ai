'use server';

import { suggestNextNodes, type SuggestNextNodesInput, type SuggestNextNodesOutput } from '@/ai/flows/suggest-next-nodes';

export async function getSuggestions(input: SuggestNextNodesInput): Promise<SuggestNextNodesOutput> {
  try {
    const suggestions = await suggestNextNodes(input);
    return suggestions;
  } catch (error) {
    console.error("Error in getSuggestions server action:", error);
    throw new Error("Failed to fetch AI suggestions.");
  }
}
