"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  FileText,
  Loader2,
  Search,
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { IconButton } from "@/components/ui";
import { Modal } from "@/components/shared";
import { Input, Select, Button } from "@/components/ui/form";
import { monthOptions, yearOptions, formatDate } from "@/data/shared";
import { usePeriod } from "./PeriodContext";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "entrada" | "saida" | "conta" | "cliente";
  title: string;
  subtitle: string;
  href: string;
}

interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  kind: "vencimento" | "atrasado" | "email";
}

const RESULT_ICON = {
  entrada: ArrowDownLeft,
  saida: ArrowUpRight,
  conta: Wallet,
  cliente: Users,
} as const;

const SEEN_NOTIF_KEY = "viaconeta-notif-seen";

function readSeenNotifIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_NOTIF_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeSeenNotifIds(ids: Set<string>) {
  localStorage.setItem(SEEN_NOTIF_KEY, JSON.stringify([...ids]));
}

function markNotificationsSeen(items: NotificationItem[]) {
  const seen = readSeenNotifIds();
  for (const item of items) seen.add(item.id);
  writeSeenNotifIds(seen);
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({
  title = "Dashboard",
  subtitle = "Visão geral das finanças",
}: HeaderProps) {
  const router = useRouter();
  const { month, year, label, setPeriod } = usePeriod();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  const [periodOpen, setPeriodOpen] = useState(false);
  const [draftMonth, setDraftMonth] = useState(month);
  const [draftYear, setDraftYear] = useState(year);

  const notifRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<NotificationItem[]>([]);

  const loadNotifications = useCallback(async (opts?: { quiet?: boolean }) => {
    if (!opts?.quiet) setNotifLoading(true);
    try {
      const [dashRes, histRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/notificacoes"),
      ]);

      const items: NotificationItem[] = [];

      if (dashRes.ok) {
        const dash = await dashRes.json();
        for (const bill of dash.upcomingBills ?? []) {
          items.push({
            id: `bill-${bill.id}`,
            title: bill.name,
            subtitle: `${bill.dueIn} · ${bill.amount}`,
            href: "/contas-a-pagar",
            kind: bill.dueIn === "Vence hoje" ? "atrasado" : "vencimento",
          });
        }
      }

      if (histRes.ok) {
        const hist = await histRes.json();
        for (const h of (hist.historico ?? []).slice(0, 5)) {
          items.push({
            id: `mail-${h.id}`,
            title: h.assunto || h.descricao,
            subtitle: `${h.fornecedor} · ${formatDate(h.enviadoEm.slice(0, 10))}`,
            href: "/configuracoes/notificacoes",
            kind: "email",
          });
        }
      }

      notificationsRef.current = items;
      setNotifications(items);

      const seen = readSeenNotifIds();
      setHasUnread(items.some((item) => !seen.has(item.id)));
      return items;
    } finally {
      if (!opts?.quiet) setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(() => {
      loadNotifications({ quiet: true });
    }, 60_000);

    function onFocus() {
      loadNotifications({ quiet: true });
    }
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadNotifications]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
        setPeriodOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (notifOpen && notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (periodOpen && periodRef.current && !periodRef.current.contains(target)) {
        setPeriodOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [notifOpen, periodOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const q = searchQuery.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/busca?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
        }
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, searchOpen]);

  function openSearch() {
    setSearchOpen(true);
    setSearchQuery("");
    setResults([]);
  }

  async function openNotif() {
    setPeriodOpen(false);
    const willOpen = !notifOpen;
    setNotifOpen(willOpen);

    if (willOpen) {
      const items = (await loadNotifications()) ?? notificationsRef.current;
      markNotificationsSeen(items);
      setHasUnread(false);
    }
  }

  function openPeriod() {
    setNotifOpen(false);
    setDraftMonth(month);
    setDraftYear(year);
    setPeriodOpen((v) => !v);
  }

  function applyPeriod(e: FormEvent) {
    e.preventDefault();
    setPeriod(draftMonth, draftYear);
    setPeriodOpen(false);
  }

  function goToResult(item: SearchResult) {
    setSearchOpen(false);
    router.push(item.href);
  }

  return (
    <header className="flex min-h-[var(--spacing-header)] items-center justify-between px-[var(--spacing-content)] pt-8 pb-6">
      <div>
        <h1 className="text-[28px] font-bold leading-tight text-white">{title}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <IconButton aria-label="Buscar" onClick={openSearch} title="Buscar (Ctrl+K)">
          <Search size={20} strokeWidth={1.75} />
        </IconButton>

        <div className="relative" ref={notifRef}>
          <IconButton
            aria-label="Notificações"
            onClick={openNotif}
            aria-expanded={notifOpen}
          >
            <Bell size={20} strokeWidth={1.75} />
          </IconButton>
          {hasUnread && (
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-primary)]"
              aria-hidden="true"
            />
          )}

          {notifOpen && (
            <div className="absolute right-0 top-12 z-40 w-[360px] overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">Notificações</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Vencimentos e lembretes recentes
                  </p>
                </div>
                <Link
                  href="/configuracoes/notificacoes"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                >
                  Configurar
                </Link>
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--color-text-secondary)]">
                    <Loader2 size={16} className="animate-spin" />
                    Carregando...
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-[var(--color-text-secondary)]">
                    Nenhuma notificação no momento
                  </p>
                ) : (
                  <ul className="flex flex-col">
                    {notifications.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setNotifOpen(false);
                            router.push(item.href);
                          }}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                        >
                          <span
                            className={cn(
                              "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                              item.kind === "email" && "bg-white/10 text-white",
                              item.kind === "vencimento" &&
                                "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
                              item.kind === "atrasado" &&
                                "bg-[var(--color-primary)]/15 text-[var(--color-primary)]",
                            )}
                          >
                            {item.kind === "email" ? (
                              <FileText size={14} />
                            ) : (
                              <CalendarDays size={14} />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-white">
                              {item.title}
                            </span>
                            <span className="mt-0.5 block truncate text-xs text-[var(--color-text-secondary)]">
                              {item.subtitle}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative ml-2" ref={periodRef}>
          <button
            type="button"
            onClick={openPeriod}
            className="flex items-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[var(--color-primary-hover)]"
            aria-label="Selecionar período"
            aria-expanded={periodOpen}
          >
            <CalendarDays size={16} strokeWidth={2} />
            <span>{label}</span>
          </button>

          {periodOpen && (
            <form
              onSubmit={applyPeriod}
              className="absolute right-0 top-12 z-40 w-[280px] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-card)]"
            >
              <p className="mb-3 text-sm font-semibold text-white">Período</p>
              <div className="flex flex-col gap-3">
                <Select
                  label="Mês"
                  options={monthOptions}
                  value={draftMonth}
                  onChange={(e) => setDraftMonth(e.target.value)}
                />
                <Select
                  label="Ano"
                  options={yearOptions}
                  value={draftYear}
                  onChange={(e) => setDraftYear(e.target.value)}
                />
                <div className="mt-1 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setPeriodOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Aplicar</Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      <Modal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Buscar"
        subtitle="Entradas, saídas, contas e clientes"
        className="max-w-xl"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Pesquisar"
            placeholder="Digite ao menos 2 caracteres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />

          <div className="min-h-[180px]">
            {searching ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-[var(--color-text-secondary)]">
                <Loader2 size={16} className="animate-spin" />
                Buscando...
              </div>
            ) : searchQuery.trim().length < 2 ? (
              <p className="py-10 text-center text-sm text-[var(--color-text-secondary)]">
                Digite para buscar em todo o sistema
              </p>
            ) : results.length === 0 ? (
              <p className="py-10 text-center text-sm text-[var(--color-text-secondary)]">
                Nenhum resultado para “{searchQuery.trim()}”
              </p>
            ) : (
              <ul className="flex max-h-[320px] flex-col gap-1 overflow-y-auto">
                {results.map((item) => {
                  const Icon = RESULT_ICON[item.type];
                  return (
                    <li key={`${item.type}-${item.id}`}>
                      <button
                        type="button"
                        onClick={() => goToResult(item)}
                        className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-white">
                            {item.title}
                          </span>
                          <span className="block truncate text-xs text-[var(--color-text-secondary)]">
                            {item.subtitle}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </Modal>
    </header>
  );
}
