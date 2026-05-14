import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../hooks/useApi';
import type {
  ActivityRow,
  IPSession,
  PaymentRow,
  TeamMemoryRow,
  UserDetail,
  UserRow,
} from './adminTypes';

export type AdminContextValue = {
  authorized: boolean;
  stats: any;
  users: UserRow[];
  payments: PaymentRow[];
  activity: ActivityRow[];
  ipSessions: IPSession[];
  sessions: any[];
  obs: any;
  teamMemory: TeamMemoryRow[];
  revenue: any;
  activityUserFilter: string;
  setActivityUserFilter: (v: string) => void;
  policyName: string;
  setPolicyName: (v: string) => void;
  policyText: string;
  setPolicyText: (v: string) => void;
  policyPriority: number;
  setPolicyPriority: (v: number) => void;
  selectedUserId: string;
  setSelectedUserId: (id: string) => void;
  selectedUser: UserDetail | null;
  page: number;
  setPage: (p: number | ((n: number) => number)) => void;
  total: number;
  search: string;
  setSearch: (s: string) => void;
  planFilter: string;
  setPlanFilter: (p: string) => void;
  loadingUsers: boolean;
  loadingDetail: boolean;
  savingUserId: string;
  loadStats: () => Promise<void>;
  loadPayments: () => Promise<void>;
  loadUsers: () => Promise<void>;
  loadActivity: () => Promise<void>;
  loadRevenue: () => Promise<void>;
  loadIPSessions: () => Promise<void>;
  loadSessions: () => Promise<void>;
  loadObservability: () => Promise<void>;
  loadTeamMemory: () => Promise<void>;
  refreshAll: () => Promise<void>;
  changePlan: (userId: string, plan: string) => Promise<void>;
  toggleAdmin: (userId: string, isAdmin: boolean) => Promise<void>;
  toggleBan: (userId: string, banned: boolean) => Promise<void>;
  money: (paise: number) => string;
  formatMinor: (amount: number, currency?: string) => string;
  paidCell: (u: UserRow) => string;
  date: (value?: string | null) => string;
  dateTime: (value?: string | null) => string;
  savePolicy: () => Promise<void>;
  updatePolicy: (id: number, patch: { status?: string; isActive?: boolean; priority?: number }) => Promise<void>;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [authorized, setAuthorized] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [ipSessions, setIPSessions] = useState<IPSession[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [obs, setObs] = useState<any>(null);
  const [teamMemory, setTeamMemory] = useState<TeamMemoryRow[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [activityUserFilter, setActivityUserFilter] = useState('');
  const [policyName, setPolicyName] = useState('');
  const [policyText, setPolicyText] = useState('');
  const [policyPriority, setPolicyPriority] = useState(100);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingUserId, setSavingUserId] = useState('');

  const path = location.pathname;

  const loadStats = useCallback(async () => {
    const res = await api.get('/admin/stats');
    setStats(res.data);
  }, []);

  const loadPayments = useCallback(async () => {
    const res = await api.get('/admin/payments?limit=80');
    setPayments(res.data.payments || []);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/admin/users', {
        params: { page, q: search.trim(), plan: planFilter },
      });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
      setAuthorized(true);
      const first = res.data.users?.[0];
      setSelectedUserId((cur) => {
        if (cur) return cur;
        return first?.id || '';
      });
    } catch {
      setAuthorized(false);
    } finally {
      setLoadingUsers(false);
    }
  }, [page, search, planFilter]);

  const loadUserDetail = useCallback(async (userId: string) => {
    if (!userId) return;
    setLoadingDetail(true);
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setSelectedUser(res.data);
      setAuthorized(true);
    } catch {
      setAuthorized(false);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const loadActivity = useCallback(async () => {
    try {
      const res = await api.get('/admin/activity', {
        params: {
          limit: 100,
          ...(activityUserFilter.trim() ? { userId: activityUserFilter.trim() } : {}),
        },
      });
      setActivity(res.data.activity || []);
    } catch {
      /* ignore */
    }
  }, [activityUserFilter]);

  const loadRevenue = useCallback(async () => {
    try {
      const res = await api.get('/admin/revenue');
      setRevenue(res.data);
    } catch {
      /* ignore */
    }
  }, []);

  const loadIPSessions = useCallback(async () => {
    try {
      const res = await api.get('/admin/ips');
      setIPSessions(res.data.ips || []);
    } catch {
      /* ignore */
    }
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const res = await api.get('/admin/sessions');
      setSessions(res.data.sessions || []);
    } catch {
      /* ignore */
    }
  }, []);

  const loadObservability = useCallback(async () => {
    try {
      const [base, live] = await Promise.all([
        api.get('/admin/observability'),
        api.get('/admin/observability/live'),
      ]);
      setObs({ ...base.data, live: live.data });
    } catch {
      /* ignore */
    }
  }, []);

  const loadTeamMemory = useCallback(async () => {
    try {
      const res = await api.get('/admin/team-memory');
      setTeamMemory(res.data.items || []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadStats().catch(() => setAuthorized(false));
  }, [loadStats]);

  useEffect(() => {
    if (!authorized) return;
    if (path.includes('/admin/users')) {
      loadUsers().catch(() => setAuthorized(false));
    }
  }, [authorized, path, page, search, planFilter, loadUsers]);

  useEffect(() => {
    if (!authorized) return;
    if (!path.includes('/admin/users')) return;
    if (selectedUserId) loadUserDetail(selectedUserId).catch(() => setAuthorized(false));
  }, [authorized, path, selectedUserId, loadUserDetail]);

  useEffect(() => {
    if (!authorized) return;
    if (path.includes('/admin/activity')) void loadActivity();
    else if (path.includes('/admin/security')) {
      void loadIPSessions();
      void loadSessions();
    } else if (path.includes('/admin/payments')) void loadPayments();
    else if (path.includes('/admin/revenue')) void loadRevenue();
    else if (path.includes('/admin/observability')) void loadObservability();
    else if (path.includes('/admin/memory')) void loadTeamMemory();
  }, [
    authorized,
    path,
    activityUserFilter,
    loadActivity,
    loadIPSessions,
    loadSessions,
    loadPayments,
    loadRevenue,
    loadObservability,
    loadTeamMemory,
  ]);

  useEffect(() => {
    if (!authorized || !path.includes('/admin/observability')) return;
    const timer = setInterval(() => {
      void loadObservability();
    }, 8000);
    return () => clearInterval(timer);
  }, [authorized, path, loadObservability]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadStats(), loadPayments(), loadUsers()]);
    if (selectedUserId) await loadUserDetail(selectedUserId);
  }, [loadStats, loadPayments, loadUsers, loadUserDetail, selectedUserId]);

  const changePlan = useCallback(
    async (userId: string, plan: string) => {
      setSavingUserId(userId);
      try {
        await api.patch(`/admin/users/${userId}/plan`, { plan });
        setUsers((current) => current.map((user) => (user.id === userId ? { ...user, plan } : user)));
        setSelectedUser((current) =>
          current?.user.id === userId ? { ...current, user: { ...current.user, plan } } : current
        );
        await loadStats();
      } finally {
        setSavingUserId('');
      }
    },
    [loadStats]
  );

  const toggleAdmin = useCallback(
    async (userId: string, isAdmin: boolean) => {
      setSavingUserId(userId);
      try {
        await api.patch(`/admin/users/${userId}/admin`, { isAdmin });
        setUsers((current) => current.map((user) => (user.id === userId ? { ...user, is_admin: isAdmin } : user)));
        setSelectedUser((current) =>
          current?.user.id === userId ? { ...current, user: { ...current.user, is_admin: isAdmin } } : current
        );
        await loadStats();
      } finally {
        setSavingUserId('');
      }
    },
    [loadStats]
  );

  const toggleBan = useCallback(
    async (userId: string, banned: boolean) => {
      setSavingUserId(userId);
      try {
        await api.patch(`/admin/users/${userId}/ban`, { banned });
        setUsers((current) => current.map((user) => (user.id === userId ? { ...user, banned } : user)));
        setSelectedUser((current) =>
          current?.user.id === userId ? { ...current, user: { ...current.user, banned } } : current
        );
        await loadStats();
      } finally {
        setSavingUserId('');
      }
    },
    [loadStats]
  );

  const money = useCallback((paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`, []);
  const formatMinor = useCallback(
    (amount: number, currency?: string) =>
      (currency || 'INR') === 'USD' ? `$${(amount / 100).toFixed(2)}` : money(amount),
    [money]
  );
  const paidCell = useCallback(
    (u: UserRow) => {
      const inr = Number(u.total_paid_inr || 0);
      const usd = Number(u.total_paid_usd || 0);
      const bits: string[] = [];
      bits.push(inr ? money(inr) : '₹0');
      if (usd) bits.push(`$${(usd / 100).toFixed(2)}`);
      return bits.join(' · ');
    },
    [money]
  );
  const date = useCallback(
    (value?: string | null) => (value ? new Date(value).toLocaleDateString('en-IN') : '—'),
    []
  );
  const dateTime = useCallback(
    (value?: string | null) => (value ? new Date(value).toLocaleString('en-IN') : '—'),
    []
  );

  const savePolicy = useCallback(async () => {
    if (!policyName.trim() || !policyText.trim()) return;
    await api.post('/admin/team-memory', {
      scope: 'global',
      policyName,
      policyText,
      status: 'draft',
      priority: policyPriority,
    });
    setPolicyName('');
    setPolicyText('');
    setPolicyPriority(100);
    await loadTeamMemory();
  }, [policyName, policyText, policyPriority, loadTeamMemory]);

  const updatePolicy = useCallback(
    async (id: number, patch: { status?: string; isActive?: boolean; priority?: number }) => {
      await api.patch(`/admin/team-memory/${id}`, patch);
      await loadTeamMemory();
    },
    [loadTeamMemory]
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      authorized,
      stats,
      users,
      payments,
      activity,
      ipSessions,
      sessions,
      obs,
      teamMemory,
      revenue,
      activityUserFilter,
      setActivityUserFilter,
      policyName,
      setPolicyName,
      policyText,
      setPolicyText,
      policyPriority,
      setPolicyPriority,
      selectedUserId,
      setSelectedUserId,
      selectedUser,
      page,
      setPage,
      total,
      search,
      setSearch,
      planFilter,
      setPlanFilter,
      loadingUsers,
      loadingDetail,
      savingUserId,
      loadStats,
      loadPayments,
      loadUsers,
      loadActivity,
      loadRevenue,
      loadIPSessions,
      loadSessions,
      loadObservability,
      loadTeamMemory,
      refreshAll,
      changePlan,
      toggleAdmin,
      toggleBan,
      money,
      formatMinor,
      paidCell,
      date,
      dateTime,
      savePolicy,
      updatePolicy,
    }),
    [
      authorized,
      stats,
      users,
      payments,
      activity,
      ipSessions,
      sessions,
      obs,
      teamMemory,
      revenue,
      activityUserFilter,
      policyName,
      policyText,
      policyPriority,
      selectedUserId,
      selectedUser,
      page,
      total,
      search,
      planFilter,
      loadingUsers,
      loadingDetail,
      savingUserId,
      loadStats,
      loadPayments,
      loadUsers,
      loadActivity,
      loadRevenue,
      loadIPSessions,
      loadSessions,
      loadObservability,
      loadTeamMemory,
      refreshAll,
      changePlan,
      toggleAdmin,
      toggleBan,
      money,
      formatMinor,
      paidCell,
      date,
      dateTime,
      savePolicy,
      updatePolicy,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
