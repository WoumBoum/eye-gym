# Contributing to Eye Gym

Thank you for your interest in contributing! This guide will help you get started.

## Ways to Contribute

- **Bug Reports**: Found a bug? Open an issue with reproduction steps
- **Feature Requests**: Have an idea? Open an issue to discuss it
- **Code Contributions**: Submit a pull request with improvements
- **Documentation**: Help improve docs, fix typos, add examples
- **Translations**: Help translate the UI to other languages

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Setup

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/WoumBoum/eye-gym.git
cd eye-gym

# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run build
```

### Project Structure

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical documentation.

For AI agents: See [CLAUDE.md](CLAUDE.md) for agent-specific instructions.

## Development Workflow

### 1. Create a Branch

```bash
# For features
git checkout -b feature/your-feature-name

# For bug fixes
git checkout -b fix/issue-description

# For documentation
git checkout -b docs/what-you-changed
```

### 2. Make Changes

- Follow the existing code style
- Write TypeScript, not JavaScript
- Use functional components with hooks
- Keep components small and focused
- Add types for all new interfaces

### 3. Test Your Changes

```bash
# Ensure TypeScript compiles
npm run build

# Test in browser
npm run dev

# Test on mobile (Chrome DevTools device mode)
# Test dark mode
# Test keyboard shortcuts (Enter/Space)
```

### 4. Commit Your Changes

Write clear commit messages:

```bash
# Good
git commit -m "Add ratio curve zoom feature"
git commit -m "Fix score calculation for edge cases"
git commit -m "Update README installation instructions"

# Bad
git commit -m "Update"
git commit -m "Fix stuff"
git commit -m "WIP"
```

### 5. Submit a Pull Request

1. Push your branch to your fork
2. Open a Pull Request against `main`
3. Fill out the PR template
4. Wait for review

## Code Style Guidelines

### TypeScript

```typescript
// Use interfaces for objects
interface Point {
  x: number;
  y: number;
}

// Use type for unions/primitives
type GamePhase = 'placement' | 'feedback';

// Explicit return types for functions
function calculateScore(a: Point, b: Point): number {
  // ...
}

// Named exports, not default
export function MyComponent() { }
export { MyComponent };  // ✓
export default MyComponent;  // ✗
```

### React Components

```typescript
// Functional components with explicit props interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### CSS

```css
/* Use CSS variables for theming */
.button {
  background: var(--color-primary);
  padding: var(--spacing-md);
}

/* BEM-like naming */
.profile-card { }
.profile-card.active { }
.profile-card-actions { }

/* Dark mode via body class */
body.dark-mode .button {
  background: var(--color-primary);
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `GameScreen.tsx`)
- Utilities: `camelCase.ts` (e.g., `scoring.ts`)
- Types: `index.ts` in `types/` directory
- CSS: `App.css` for global styles

## Pull Request Guidelines

### PR Title

Use a clear, descriptive title:
- `Add: Timeline zoom controls`
- `Fix: Score calculation overflow`
- `Update: Improve dark mode colors`
- `Docs: Add API documentation`

### PR Description

Include:
- What changes were made
- Why the changes were needed
- How to test the changes
- Screenshots for UI changes

### PR Size

- Keep PRs focused and small
- One feature/fix per PR
- Split large changes into multiple PRs

## Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged

## AI Contributors

AI agents (Claude, Copilot, etc.) are welcome contributors!

Please:
- Read [CLAUDE.md](CLAUDE.md) for context
- Follow the same guidelines as human contributors
- Include `Co-Authored-By` in commits if applicable
- Test changes thoroughly before submitting

## Questions?

- Open an issue for questions
- Check existing issues for similar questions
- Read the documentation first

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
