import { Component, Show, lazy, Suspense, onMount } from 'solid-js';
import { Router, Route, Navigate, useLocation } from '@solidjs/router';
import { authStore } from './stores/authStore';
import { uiStore } from './stores/uiStore';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Project = lazy(() => import('./pages/Project'));
const Board = lazy(() => import('./pages/Board'));
const Admin = lazy(() => import('./pages/Admin'));

// Loading component
const LoadingSpinner: Component = () => (
  <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
    <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
  </div>
);

// Protected Route wrapper
const ProtectedRoute: Component<{ children: any }> = (props) => {
  const location = useLocation();

  return (
    <Show
      when={!authStore.isLoading()}
      fallback={<LoadingSpinner />}
    >
      <Show
        when={authStore.isAuthenticated()}
        fallback={<Navigate href={`/login?redirect=${location.pathname}`} />}
      >
        {props.children}
      </Show>
    </Show>
  );
};

// Admin Route wrapper (requires Admin role)
const AdminRoute: Component<{ children: any }> = (props) => {
  const location = useLocation();

  return (
    <Show
      when={!authStore.isLoading()}
      fallback={<LoadingSpinner />}
    >
      <Show
        when={authStore.isAuthenticated()}
        fallback={<Navigate href={`/login?redirect=${location.pathname}`} />}
      >
        <Show
          when={authStore.user()?.role === 'Admin'}
          fallback={<Navigate href="/dashboard" />}
        >
          {props.children}
        </Show>
      </Show>
    </Show>
  );
};

// Public Route wrapper (redirects to dashboard if already logged in)
const PublicRoute: Component<{ children: any }> = (props) => {
  return (
    <Show
      when={!authStore.isLoading()}
      fallback={<LoadingSpinner />}
    >
      <Show
        when={!authStore.isAuthenticated()}
        fallback={<Navigate href="/dashboard" />}
      >
        {props.children}
      </Show>
    </Show>
  );
};

// Wrapper component to initialize stores
const AppRoot: Component<{ children?: any }> = (props) => {
  onMount(() => {
    authStore.initialize();
    uiStore.initializeDarkMode();
  });

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {props.children}
    </Suspense>
  );
};

// Page wrappers
const LoginPage = () => (
  <PublicRoute>
    <Login />
  </PublicRoute>
);

const RegisterPage = () => (
  <PublicRoute>
    <Register />
  </PublicRoute>
);

const DashboardPage = () => (
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
);

const ProjectPage = () => (
  <ProtectedRoute>
    <Project />
  </ProtectedRoute>
);

const BoardPage = () => (
  <ProtectedRoute>
    <Board />
  </ProtectedRoute>
);

const AdminPage = () => (
  <AdminRoute>
    <Admin />
  </AdminRoute>
);

const RedirectToDashboard = () => <Navigate href="/dashboard" />;

const App: Component = () => {
  return (
    <Router root={AppRoot}>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/projects/:id" component={ProjectPage} />
      <Route path="/boards/:id" component={BoardPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/" component={RedirectToDashboard} />
      <Route path="*" component={RedirectToDashboard} />
    </Router>
  );
};

export default App;
