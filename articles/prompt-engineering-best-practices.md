# Prompt Engineering Best Practices

## Overview
Prompt Engineering is the practice of designing and refining inputs (prompts) to guide Large Language Models (LLMs) toward producing optimal outputs. As models integrate deeply into production software, prompt engineering has evolved from "talking to a chatbot" to a rigorous engineering discipline.

## Why it matters
An LLM is a probabilistic engine. A vague prompt yields a vague, generic, or hallucinated response. A highly structured, deterministic prompt minimizes hallucinations, standardizes output formats (like JSON), and directly reduces token costs.

## How it works

Writing great prompts involves providing context, defining rules, formatting the output, and giving the model space to "think".

### 1. System Prompts vs User Prompts
- **System Prompt**: Defines the persona, rules, and absolute boundaries. (e.g., *"You are a strict JSON API. You will only output valid JSON. Do not include markdown."*)
- **User Prompt**: The specific task or input data for the current execution.

### 2. Few-Shot Prompting
Instead of just telling the model what to do (Zero-shot), show it examples.

```text
Classify the sentiment of the text.

Text: "I love this product!"
Sentiment: Positive

Text: "The battery life is terrible."
Sentiment: Negative

Text: "The screen is okay, but I expected more."
Sentiment:
```

### 3. Chain of Thought (CoT)
Models struggle with complex logic if forced to answer immediately. Ask the model to "think step by step".

> [!TIP]
> By forcing the model to write out its intermediate reasoning steps, you allow it to allocate more compute (tokens) to the problem, dramatically increasing accuracy on math and logic tasks.

## Example: The "Perfect" Production Prompt

When building features like data extraction, structure your prompts using XML or Markdown delimiters to separate instructions from data.

```text
You are a data extraction assistant.
Extract the user's NAME and AGE from the text below.

<rules>
1. Output MUST be valid JSON.
2. If the age is missing, use null.
3. Do not include any explanations.
</rules>

<input>
Hi, my name is Sarah and I just turned 28 years old!
</input>

<output>
```

## Best Practices
- **Be Specific**: Don't say "Write a short summary." Say "Write a 3-sentence summary targeting a high-school reading level."
- **Tell it what TO do, not what NOT to do**: Negative constraints are harder for LLMs to follow. Instead of "Don't use complex words," say "Use simple, everyday vocabulary."
- **Structure outputs with JSON**: If a programmatic system is consuming the output, enforce JSON mode and provide a JSON schema in the prompt.

## Common Mistakes
- ❌ Trusting the LLM completely. Always build parsing logic and fallbacks in your application code in case the model hallucinates a bad format.
- ❌ Packing too many unrelated instructions into a single prompt. If the task is complex, break it down into an agentic workflow with multiple smaller prompts.

## Further Reading
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Engineering Interactive Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)
