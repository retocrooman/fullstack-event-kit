# Scripts

This directory contains scripts to improve development efficiency.

## ai-commit-message.sh

A script that uses Claude Code CLI (preferred) or Ollama as fallback to analyze git diff and automatically generate conventional commit messages.

### Setup

#### Option 1: Claude Code CLI (Recommended)

Make sure Claude Code is running. The script will automatically detect and use the `claude` command.

#### Option 2: Ollama (Fallback)

1. Install Ollama (https://ollama.ai)
2. Start Ollama:
   ```bash
   ollama serve
   ```
3. Download llama3:instruct model:
   ```bash
   ollama pull llama3:instruct
   ```

### Usage

```bash
# Default: Interactive mode with Claude Code CLI (or Ollama fallback)
./scripts/ai-commit-message.sh

# Auto commit without confirmation
./scripts/ai-commit-message.sh --commit

# Force interactive mode
./scripts/ai-commit-message.sh --interactive

# Force Ollama usage (skip Claude)
./scripts/ai-commit-message.sh --ollama

# Use different Ollama model
OLLAMA_MODEL=llama3.2:3b ./scripts/ai-commit-message.sh
```

### Features

- **Claude Code Integration**: Uses Claude Code CLI for superior commit messages
- **Smart Fallback**: Automatically falls back to Ollama if Claude Code is not running
- **Private**: Complete local execution with no external API calls
- **Conventional Commits**: Generates proper conventional commit format
- **Interactive Mode**: Review and confirm messages before committing
- **Flexible**: Support for both Claude Code and various Ollama models
- **No API Key Required**: Uses existing Claude Code session

### Commit Message Format

The script generates commit messages following conventional commits format:

```
<type>: <description>
```

**Valid types:**
- `feat`: New features
- `fix`: Bug fixes  
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without functionality changes
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build config, etc.)
- `perf`: Performance improvements
- `build`: Build system changes
- `ci`: CI/CD pipeline changes

**Examples:**
- `feat: add user authentication with JWT tokens`
- `fix: resolve database connection timeout issue`
- `docs: update API documentation for user endpoints`
- `chore: update dependencies to latest versions`

### Troubleshooting

**Claude Code Issues:**
```bash
# Check if Claude Code CLI is available
which claude

# Test Claude Code CLI
echo "Hello" | claude -p
```

**Ollama Issues:**
```bash
# Check if Ollama is running
curl -s http://localhost:11434/api/tags

# Start Ollama service
ollama serve

# List available models
ollama list

# Pull model if missing
ollama pull llama3:instruct
```

**General Issues:**
- Ensure you have staged changes: `git add .`
- Check script permissions: `chmod +x scripts/ai-commit-message.sh`
- Use `--ollama` flag to bypass Claude and test Ollama directly

---

## Other Scripts

- **docker.test.sh**: Docker testing utilities
- **push.sh**: Git push automation
- **release-tag.sh**: Release tagging utilities
- **remove-node-modules.sh**: Clean node_modules directories
- **reset-docker.sh**: Docker environment reset
