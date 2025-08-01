#!/bin/bash
set -e

# Claude API is the preferred AI provider, fallback to Ollama if not available
AI_PROVIDER=${AI_PROVIDER:-"claude"}
MODEL=${OLLAMA_MODEL:-"llama3:instruct"}

check_claude() {
  if ! command -v claude >/dev/null 2>&1; then
    echo "❌ Claude Code CLI not found. Please make sure Claude Code is running."
    exit 1
  fi
}

check_ollama() {
  command -v ollama >/dev/null || { echo "❌ Ollama not installed"; exit 1; }
  curl -s http://localhost:11434/api/tags > /dev/null || { echo "❌ Ollama not running"; exit 1; }
  ollama list | grep -q "$MODEL" || ollama pull "$MODEL"
}

generate_prompt() {
  files=$(git diff --cached --name-only | tr '\n' ' ')
  diffstat=$(git diff --cached --stat)
  git diff --cached --unified=3 | head -c 30000 > /tmp/git-diff.txt
  diffcontent=$(cat /tmp/git-diff.txt)

  cat <<EOF
Generate a Git commit message for the following changes.

Requirements:
- Use conventional commits format: <type>: <description>
- Use present tense, imperative mood (e.g., "add feature" not "added feature")
- No trailing period
- Keep description under 72 characters
- Use these types: feat, fix, chore, docs, test, refactor, style, perf, build, ci
- Focus on WHAT changed and WHY, not HOW

Changed files:
$files

Diff summary:
$diffstat

Diff content (truncated if large):
$diffcontent

Return only the commit message, no other text.
EOF
}


call_claude() {
  local prompt=$(generate_prompt)
  
  # Use Claude Code CLI to generate commit message
  echo "$prompt" | claude -p | grep -E '^(feat|fix|docs|style|refactor|test|chore|perf|build|ci):' | head -1
}

call_ollama() {
  prompt=$(generate_prompt | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
  payload="{\"model\":\"$MODEL\",\"prompt\":$prompt,\"stream\":false}"

  curl -s -X POST http://localhost:11434/api/generate \
    -H "Content-Type: application/json" \
    -d "$payload" | python3 -c 'import sys, json; print(json.load(sys.stdin)["response"].splitlines()[0])'
}

interactive_commit() {
  echo "💬 Generated commit message:"
  echo "   $1"
  echo ""
  echo "Press Enter to commit, or any other key + Enter to cancel:"
  read -r response
  
  if [[ -z "$response" ]]; then
    git commit -m "$1"
    echo "✅ Committed successfully!"
  else
    echo "❌ Commit cancelled"
    exit 1
  fi
}


generate_ai_message() {
  if [[ "$AI_PROVIDER" == "claude" ]]; then
    if command -v claude >/dev/null 2>&1; then
      check_claude
      call_claude
    else
      echo "⚠️  Claude Code CLI not found, falling back to Ollama..."
      AI_PROVIDER="ollama"
      check_ollama
      call_ollama
    fi
  else
    check_ollama
    call_ollama
  fi
}

main() {
  # Check for --commit flag for backward compatibility
  [[ "$1" == "--commit" ]] && commit_flag=true
  
  # Check for --interactive or -i flag
  [[ "$1" == "--interactive" || "$1" == "-i" ]] && interactive_flag=true
  
  # Check for --ollama flag to force Ollama usage
  [[ "$1" == "--ollama" ]] && AI_PROVIDER="ollama"

  git diff --cached --quiet && echo "❌ No staged changes" && exit 1

  echo "🤖 Generating commit message with $AI_PROVIDER..."
  msg=$(generate_ai_message)
  
  if [[ "$interactive_flag" = true ]]; then
    interactive_commit "$msg"
  elif [[ "$commit_flag" = true ]]; then
    echo "💬 $msg"
    git commit -m "$msg"
  else
    # Default behavior: interactive mode
    interactive_commit "$msg"
  fi
}

main "$@"
