'use server';

/**
 * @fileOverview AI tool that suggests the next nodes to add to the canvas, suggesting paths and exploring ‘what-if’ scenarios based on the current workflow context.
 *
 * - suggestNextNodes - A function that suggests the next logical nodes.
 * - SuggestNextNodesInput - The input type for the suggestNextNodes function.
 * - SuggestNextNodesOutput - The return type for the suggestNextNodes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNextNodesInputSchema = z.object({
  existingNodes: z.array(z.string()).describe('The list of existing nodes in the workflow.'),
  currentNode: z.string().optional().describe('The currently selected node.'),
});
export type SuggestNextNodesInput = z.infer<typeof SuggestNextNodesInputSchema>;

const SuggestNextNodesOutputSchema = z.object({
  suggestedNodes: z.array(z.string()).describe('The list of suggested next nodes to add to the workflow.'),
  reasoning: z.string().describe('The AI reasoning behind the node suggestions.'),
});
export type SuggestNextNodesOutput = z.infer<typeof SuggestNextNodesOutputSchema>;

export async function suggestNextNodes(input: SuggestNextNodesInput): Promise<SuggestNextNodesOutput> {
  return suggestNextNodesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNextNodesPrompt',
  input: {schema: SuggestNextNodesInputSchema},
  output: {schema: SuggestNextNodesOutputSchema},
  prompt: `You are an AI workflow assistant that suggests the next logical nodes to add to a workflow.

Given the existing nodes in the workflow: {{{existingNodes}}}

And the currently selected node (if any): {{{currentNode}}}

Suggest the next nodes that would logically extend the workflow, and explain your reasoning.

Ensure that the suggestedNodes output field is a list of strings, and the reasoning field clearly explains why you are suggesting these nodes and what purpose they would serve in the workflow.

Return the suggestions in JSON format.
`,
});

const suggestNextNodesFlow = ai.defineFlow(
  {
    name: 'suggestNextNodesFlow',
    inputSchema: SuggestNextNodesInputSchema,
    outputSchema: SuggestNextNodesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
