import { useApiHealth, type ApiStatus } from '@/hooks/useApiHealth';
import { cn } from '@/lib/utils';

const STATUS_STYLE: Record<ApiStatus, { dot: string; label: string }> = {
  verificando: { dot: 'bg-muted-foreground animate-pulse', label: 'API…' },
  online: { dot: 'bg-success', label: 'API online' },
  offline: { dot: 'bg-destructive', label: 'API offline' },
};

export function ApiStatusIndicator({ className }: { className?: string }) {
  const status = useApiHealth();
  const { dot, label } = STATUS_STYLE[status];

  return (
    <span
      className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', className)}
      title={`Status do servidor Express: ${status}`}
      role="status"
    >
      <span className={cn('size-2 rounded-full', dot)} aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}
