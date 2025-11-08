'use server';
/**
 * @fileOverview Generates a starting workflow on the canvas based on a text prompt.
 *
 * - generateWorkflowFromPrompt - A function that generates a workflow from a text prompt.
 * - GenerateWorkflowFromPromptInput - The input type for the generateWorkflowFromPrompt function.
 * - GenerateWorkflowFromPromptOutput - The return type for the generateWorkflowFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWorkflowFromPromptInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired AI workflow.'),
});
export type GenerateWorkflowFromPromptInput = z.infer<typeof GenerateWorkflowFromPromptInputSchema>;

const GenerateWorkflowFromPromptOutputSchema = z.object({
  workflowDefinition: z.string().describe('A JSON string representing the generated workflow definition with interconnected nodes.'),
});
export type GenerateWorkflowFromPromptOutput = z.infer<typeof GenerateWorkflowFromPromptOutputSchema>;

export async function generateWorkflowFromPrompt(input: GenerateWorkflowFromPromptInput): Promise<GenerateWorkflowFromPromptOutput> {
  return generateWorkflowFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorkflowFromPromptPrompt',
  input: {schema: GenerateWorkflowFromPromptInputSchema},
  output: {schema: GenerateWorkflowFromPromptOutputSchema},
  prompt: `You are an AI workflow generator.  The user will provide a prompt describing the workflow they want to create.

  Your job is to generate a JSON string representing a workflow definition that consists of interconnected nodes.  The nodes should represent AI and/or IoT actions.  The workflow should implement the behavior described in the user's prompt.

  Here is the user's prompt:
  {{prompt}}

  Ensure that the JSON is properly escaped.
  `,
});

const generateWorkflowFromPromptFlow = ai.defineFlow(
  {
    name: 'generateWorkflowFromPromptFlow',
    inputSchema: GenerateWorkflowFromPromptInputSchema,
    outputSchema: GenerateWorkflowFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
