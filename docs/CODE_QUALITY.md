# Wathiqati Code Quality & Best Practices

## 🏗️ Project Architecture

### Folder Structure
```
mon-portail-administratif/
├── src/
│   ├── pages/              # Page components (one per route)
│   ├── components/         # Reusable components
│   │   ├── ui/            # UI components (buttons, inputs, etc.)
│   │   └── layout/        # Layout components
│   ├── contexts/          # React Context (Auth, Language)
│   ├── services/          # API client and business logic
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── styles/            # Global styles
│   ├── App.jsx            # Entry point with routes
│   └── index.js           # React render
├── public/
└── build/                 # Production build

backend/
├── routes/                # Express route handlers
├── controllers/           # Business logic
├── models/               # Sequelize models
├── middleware/           # Express middleware
├── services/             # Reusable services
├── utils/                # Utility functions
├── config/               # Configuration files
├── logs/                 # Application logs
└── server.js             # Entry point
```

---

## 💻 Code Standards

### 1. **React Components**

**DO:**
```jsx
// Functional component with hooks
function MyComponent({ title, onAction, children }) {
  const [state, setState] = useState(null);
  const { t } = useLanguage();
  const { success, error } = useToast();

  const handleClick = async () => {
    try {
      const result = await doSomething();
      success('Success!');
    } catch (err) {
      error(err);
    }
  };

  return (
    <div>
      {/* JSX content */}
    </div>
  );
}

export default MyComponent;
```

**DON'T:**
```jsx
// ❌ Class components (unless error boundary)
// ❌ Direct console.log (use logger)
// ❌ Silent error swallowing
// ❌ Inline styles
// ❌ Hardcoded strings (use i18n)
```

### 2. **Custom Hooks**

```javascript
// Good: Extract logic into reusable hook
export function useFetchRequests(page = 1, filters = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { error: showError } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await api.getRequests({ page, ...filters });
        setData(result);
      } catch (err) {
        setError(err);
        showError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, filters]);

  return { data, loading, error };
}
```

### 3. **API Calls**

```javascript
// ✅ Good: Use new api.client.js with proper error handling
import * as api from '../services/api.client';

const handleApprove = async () => {
  try {
    const result = await api.approveRequest(id, 'comment');
    toast.success('Request approved');
  } catch (err) {
    toast.error(err); // Automatically gets user-friendly message
  }
};
```

### 4. **Error Handling**

```javascript
// ✅ Good: Show user-friendly errors
try {
  await doSomething();
} catch (error) {
  toast.error(error); // Shows formatted message to user
}

// ✅ Good: Log for debugging
if (process.env.NODE_ENV === 'development') {
  console.error('Debug info:', error);
}

// ❌ Bad: Silent failure
try {
  await doSomething();
} catch (error) {
  console.error(error); // User doesn't know what happened
}
```

### 5. **Conditional Rendering**

```javascript
// ✅ Good
{loading && <Skeleton />}
{error && <ErrorAlert error={error} />}
{!loading && !error && data.length > 0 && <List data={data} />}
{!loading && !error && data.length === 0 && <EmptyState />}

// ✅ Also good (using custom hook/component)
if (loading) return <Skeleton />;
if (error) return <ErrorAlert error={error} />;
if (!data?.length) return <EmptyState />;

return <List data={data} />;
```

---

## 🔒 Security Guidelines

### 1. **Never expose sensitive data:**

```javascript
// ❌ Bad
const response = { userId, token, password }; // Never log password!

// ✅ Good
const response = { userId, userName }; // Safe to log
```

### 2. **Protect routes:**

```jsx
// ✅ Good: Protected route with role check
const ProtectedRoute = ({ element, adminOnly = false, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;
  if (roles.length && !roles.includes(user.role)) return <Navigate to="/" />;

  return element;
};
```

### 3. **Validate input:**

```javascript
// ✅ Good
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

if (!validateEmail(email)) {
  setError('Invalid email');
  return;
}
```

---

## 🎨 UI/UX Standards

### 1. **Color Palette**

```js
// Tailwind theme colors (in tailwind.config.js)
colors: {
  primary: '#9B1C1C',    // Brand red
  secondary: '#C8A951',   // Accent gold
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
}
```

### 2. **Component States**

Every component should handle these states:
- Default
- Loading (disabled, spinner)
- Success (highlight, checkmark)
- Error (red highlight, error message)
- Disabled

```jsx
<button 
  disabled={loading}
  className={`
    px-4 py-2 rounded-lg font-medium transition-all
    ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}
    ${error ? 'ring-2 ring-red-500' : ''}
  `}
>
  {loading ? <Spinner /> : 'Submit'}
</button>
```

### 3. **Loading States**

Different types of loading indicators:
- **Skeleton screens** for initial page load
- **Spinner** for button actions
- **Progress bar** for file uploads
- **Overlay** for full-screen operations

---

## 📊 Performance Checklist

- [ ] Use `React.memo()` for expensive components
- [ ] Implement pagination (lazy load large lists)
- [ ] Use debounce/throttle for search/filter inputs
- [ ] Lazy load routes with `React.lazy()`
- [ ] Optimize images (compress, WebP format)
- [ ] Minimize bundle size (check with source-map-explorer)
- [ ] Use React DevTools Profiler to identify slow renders
- [ ] Cache API responses appropriately
- [ ] Avoid inline functions in component render

---

## 🧪 Testing Standards

### Unit Tests (Jest)
```javascript
describe('useFetchRequests', () => {
  it('should fetch data on mount', async () => {
    const { result } = renderHook(() => useFetchRequests());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
```

### Component Tests (React Testing Library)
```javascript
describe('RequestCard', () => {
  it('should render request details', () => {
    const { getByText } = render(
      <RequestCard request={mockRequest} />
    );
    expect(getByText(mockRequest.title)).toBeInTheDocument();
  });
});
```

### E2E Tests (Cypress)
```javascript
describe('Request Flow', () => {
  it('should create and approve a request', () => {
    cy.login();
    cy.visit('/new-request');
    cy.get('input[name="title"]').type('Test Request');
    cy.get('button[type="submit"]').click();
    cy.contains('Request created successfully');
  });
});
```

---

## 📝 Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `RequestList`, `AdminDashboard` |
| Hooks | camelCase + "use" prefix | `useFetchRequests`, `useToast` |
| Variables/Functions | camelCase | `userName`, `handleSubmit` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_TIMEOUT` |
| Classes | PascalCase | `ApiError`, `RequestModel` |
| Files | kebab-case (optional) or match component | `request-list.jsx` or `RequestList.jsx` |

---

## ✅ Pre-Commit Checklist

Before committing code:

```bash
# 1. Format code
npm run format

# 2. Lint
npm run lint

# 3. Run tests
npm test

# 4. Build
npm run build

# 5. Check for console errors
# Remove all console.log, console.warn, console.error

# 6. Verify no hardcoded URLs
grep -r "http://localhost" src/

# 7. Check for TODO/FIXME comments
grep -r "TODO\|FIXME" src/
```

---

## 🚀 Deployment Readiness

Before deploying to production:

```bash
# Verify environment variables
cat .env.production

# Build and test
npm run build
npm run test

# Check bundle size
npx source-map-explorer 'build/static/js/*.js'

# Audit dependencies
npm audit

# Security check
npm run security-check
```

---

## 📚 Resources

- [React Best Practices](https://react.dev/learn)
- [JavaScript Style Guide](https://google.github.io/styleguide/javascriptguide.html)
- [Accessibility (a11y)](https://www.a11y-101.com/)
- [Web Performance](https://web.dev/performance/)

---

Generated: 2026-03-26
Last Updated: v1.0
