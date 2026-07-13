"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, ArrowUp, ArrowDown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/primitives/avatar";
import { StatusBadge, type ProjectStatus } from "@/components/primitives/status-badge";
import { formatNumber, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CreateProjectDialog } from "./create-project-dialog";
import { DeleteProjectDialog } from "./delete-project-dialog";
import { toast } from "@/components/toast/use-toast";

export interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  owner: string;
  status: ProjectStatus;
  requests: number;
}

const PAGE_SIZE = 6;
const STATUS_FILTERS: Array<{ key: "all" | ProjectStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "archived", label: "Archived" },
];

type SortField = "name" | "requests" | "updated";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProjectsView({
  rows,
  canDelete,
  orgName,
  orgSlug,
}: {
  rows: ProjectRow[];
  canDelete: boolean;
  orgName: string;
  orgSlug: string;
}) {
  const router = useRouter();
  const [view, setView] = React.useState<"table" | "board">("table");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | ProjectStatus>("all");
  const [sort, setSort] = React.useState<{ field: SortField; dir: "asc" | "desc" }>({
    field: "updated",
    dir: "desc",
  });
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(0);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = rows.filter((r) => {
      const matchesQuery = !q || r.name.toLowerCase().includes(q) || slugify(r.name).includes(q);
      const matchesStatus = status === "all" || r.status === status;
      return matchesQuery && matchesStatus;
    });
    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      if (sort.field === "name") cmp = a.name.localeCompare(b.name);
      else if (sort.field === "requests") cmp = a.requests - b.requests;
      else cmp = a.createdAt.localeCompare(b.createdAt);
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [rows, search, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  React.useEffect(() => setPage(0), [search, status]);

  function toggleSort(field: SortField) {
    setSort((s) => (s.field === field ? { field, dir: s.dir === "asc" ? "desc" : "asc" } : { field, dir: "asc" }));
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
  function toggleSelectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageRows.forEach((r) => next.delete(r.id));
      else pageRows.forEach((r) => next.add(r.id));
      return next;
    });
  }

  const SortArrow = ({ field }: { field: SortField }) =>
    sort.field === field ? (
      sort.dir === "asc" ? (
        <ArrowUp className="inline h-3 w-3" />
      ) : (
        <ArrowDown className="inline h-3 w-3" />
      )
    ) : null;

  return (
    <div className="animate-reveal">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[24px] font-semibold tracking-[-.02em] text-ink">Projects</h1>
          <p className="mt-1 text-muted">
            {rows.length} {rows.length === 1 ? "project" : "projects"} in {orgName}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex rounded-md bg-wash-track p-[3px]">
            {(["table", "board"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-[7px] px-3 py-1 text-[13px] font-medium capitalize",
                  view === v ? "bg-surface text-ink shadow-card" : "text-muted",
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New project
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <div className="flex h-[38px] min-w-[200px] max-w-[320px] flex-1 items-center gap-2 rounded-md border border-line bg-surface px-3">
          <Search className="h-[15px] w-[15px] text-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
          />
        </div>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatus(f.key)}
            className={cn(
              "h-[38px] rounded-md border px-3 text-[13px] font-medium",
              status === f.key
                ? "border-accent-tint-border bg-accent-tint text-accent-tint-fg"
                : "border-line bg-surface text-muted hover:bg-wash-hover",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {view === "table" ? (
        <TableView
          pageRows={pageRows}
          filteredCount={filtered.length}
          totalCount={rows.length}
          page={safePage}
          pageCount={pageCount}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          selected={selected}
          onToggleSelect={toggleSelect}
          allOnPageSelected={allOnPageSelected}
          onToggleSelectAll={toggleSelectAll}
          onClearSelection={() => setSelected(new Set())}
          canDelete={canDelete}
          onBulkArchive={() => {
            toast({ title: `Archived ${selected.size} projects`, variant: "success" });
            setSelected(new Set());
          }}
          onBulkDelete={async () => {
            const ids = [...selected];
            const { deleteProject } = await import("@/app/actions");
            for (const id of ids) await deleteProject(id);
            toast({ title: `Deleted ${ids.length} projects`, variant: "success" });
            setSelected(new Set());
            router.refresh();
          }}
          onOpen={(id) => router.push(`/projects/${id}`)}
          onDelete={(row) => setDeleteTarget({ id: row.id, name: row.name })}
          toggleSort={toggleSort}
          SortArrow={SortArrow}
          onCreate={() => setCreateOpen(true)}
        />
      ) : (
        <BoardView rows={filtered} onOpen={(id) => router.push(`/projects/${id}`)} />
      )}

      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
      <DeleteProjectDialog project={deleteTarget} orgSlug={orgSlug} onDone={() => setDeleteTarget(null)} />
    </div>
  );
}

function TableView(props: {
  pageRows: ProjectRow[];
  filteredCount: number;
  totalCount: number;
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  allOnPageSelected: boolean;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  canDelete: boolean;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  onOpen: (id: string) => void;
  onDelete: (row: ProjectRow) => void;
  toggleSort: (field: SortField) => void;
  SortArrow: React.ComponentType<{ field: SortField }>;
  onCreate: () => void;
}) {
  const { pageRows, selected, SortArrow } = props;
  const th = "px-3 py-3 text-[11.5px] font-semibold uppercase tracking-wide text-muted";

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      {selected.size > 0 && (
        <div className="flex animate-reveal items-center gap-3 border-b border-accent-tint-border bg-accent-tint px-3.5 py-2.5">
          <span className="text-[13px] font-semibold text-accent-tint-fg">{selected.size} selected</span>
          <Button size="sm" variant="secondary" onClick={props.onBulkArchive}>
            Archive
          </Button>
          {props.canDelete ? (
            <Button size="sm" variant="danger" onClick={props.onBulkDelete}>
              Delete
            </Button>
          ) : (
            <span title="Only owners and admins can delete projects" className="inline-flex">
              <Button size="sm" variant="danger" disabled>
                <Lock className="h-3.5 w-3.5" /> Delete
              </Button>
            </span>
          )}
          <button
            onClick={props.onClearSelection}
            className="ml-auto text-[13px] text-accent-tint-fg hover:text-accent-hover"
          >
            Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-line bg-wash-hover">
              <th className="w-11 py-3 pl-4">
                <input
                  type="checkbox"
                  checked={props.allOnPageSelected}
                  onChange={props.onToggleSelectAll}
                  className="h-[15px] w-[15px] accent-accent"
                  aria-label="Select all"
                />
              </th>
              <th className={cn(th, "cursor-pointer select-none text-left")} onClick={() => props.toggleSort("name")}>
                Project <SortArrow field="name" />
              </th>
              <th className={cn(th, "text-left")}>Status</th>
              <th className={cn(th, "text-left")}>Owner</th>
              <th
                className={cn(th, "cursor-pointer select-none text-right")}
                onClick={() => props.toggleSort("requests")}
              >
                Requests <SortArrow field="requests" />
              </th>
              <th
                className={cn(th, "cursor-pointer select-none pr-4 text-right")}
                onClick={() => props.toggleSort("updated")}
              >
                Updated <SortArrow field="updated" />
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr
                key={r.id}
                onClick={() => props.onOpen(r.id)}
                className={cn(
                  "cursor-pointer border-b border-wash-track last:border-0 hover:bg-wash-hover",
                  selected.has(r.id) && "bg-accent-tint/40",
                )}
              >
                <td className="py-3 pl-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => props.onToggleSelect(r.id)}
                    className="h-[15px] w-[15px] accent-accent"
                    aria-label={`Select ${r.name}`}
                  />
                </td>
                <td className="p-3">
                  <div className="text-[13.5px] font-semibold text-ink">{r.name}</div>
                  <div className="font-mono text-[11.5px] text-faint">{slugify(r.name)}</div>
                </td>
                <td className="p-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={r.owner} size={24} />
                    <span className="text-[13px] text-label">{r.owner}</span>
                  </div>
                </td>
                <td className="p-3 text-right font-mono text-[12.5px] text-label">{formatNumber(r.requests)}</td>
                <td className="p-3 pr-4 text-right font-mono text-[12px] text-faint">
                  {formatRelative(r.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {props.filteredCount === 0 && (
        <div className="px-5 py-14 text-center">
          <div className="text-[15px] font-semibold text-ink">No projects match your filters</div>
          <div className="mb-4 mt-1 text-muted">Try clearing search or filters, or create a new project.</div>
          <Button onClick={props.onCreate}>Create project</Button>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-wash-track px-4 py-3">
        <span className="text-[12.5px] text-muted">
          {props.filteredCount === 0
            ? "No results"
            : `Showing ${props.page * PAGE_SIZE + 1}–${Math.min(
                (props.page + 1) * PAGE_SIZE,
                props.filteredCount,
              )} of ${props.filteredCount}`}
        </span>
        <div className="flex gap-1.5">
          <Button size="sm" variant="secondary" disabled={props.page === 0} onClick={props.onPrev}>
            Prev
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={props.page >= props.pageCount - 1}
            onClick={props.onNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function BoardView({ rows, onOpen }: { rows: ProjectRow[]; onOpen: (id: string) => void }) {
  const columns: Array<{ status: ProjectStatus; title: string; dot: string }> = [
    { status: "active", title: "Active", dot: "#067647" },
    { status: "paused", title: "Paused", dot: "#B54708" },
    { status: "archived", title: "Archived", dot: "#98A2B3" },
  ];
  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
      {columns.map((col) => {
        const cards = rows.filter((r) => r.status === col.status);
        return (
          <div key={col.status} className="rounded-lg border border-wash-deep bg-wash p-3">
            <div className="mb-3 flex items-center gap-2 px-0.5">
              <span className="h-2 w-2 rounded-full" style={{ background: col.dot }} />
              <span className="text-[13.5px] font-semibold text-ink">{col.title}</span>
              <span className="font-mono text-[12px] text-faint">{cards.length}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {cards.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onOpen(c.id)}
                  className="rounded-md border border-line bg-surface p-3 text-left hover:border-line-strong"
                >
                  <div className="text-[13.5px] font-semibold text-ink">{c.name}</div>
                  <div className="mb-2.5 font-mono text-[11px] text-faint">{slugify(c.name)}</div>
                  <div className="flex items-center justify-between">
                    <Avatar name={c.owner} size={24} />
                    <span className="font-mono text-[11px] text-muted">{formatNumber(c.requests)}</span>
                  </div>
                </button>
              ))}
              {cards.length === 0 && <div className="px-1 py-2 text-[12.5px] text-faint">No projects</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
