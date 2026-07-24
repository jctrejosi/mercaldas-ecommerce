import { Bell, Package, Tag, AlertCircle, Info, X } from 'lucide-react';
import type { AppNotification } from '../../hooks/useNotifications';

interface NotificationsDropdownProps {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAsRead: (id: number) => void;
  onNavigate: () => void;
  onClose: () => void;
}

const typeIcons: Record<string, typeof Package> = {
  ORDER: Package,
  PAYMENT: Package,
  PROMOTION: Tag,
  INFO: Info,
  SUCCESS: Info,
  WARNING: AlertCircle,
  ERROR: AlertCircle,
};

const typeColors: Record<string, string> = {
  ORDER: '#F59E0B',
  PAYMENT: '#10B981',
  PROMOTION: '#EC4899',
  INFO: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
};

export function NotificationsDropdown({ notifications, unreadCount, onMarkAsRead, onNavigate, onClose }: NotificationsDropdownProps) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] bg-white rounded-2xl border border-border shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" style={{ color: '#1A1A2E' }} />
          <span className="font-bold text-sm text-foreground">Notificaciones</span>
          {unreadCount > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#FFF200', color: '#1A1A2E' }}>
              {unreadCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
            <Bell className="w-10 h-10 text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">No tienes notificaciones</p>
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = typeIcons[n.type] ?? Info;
            const color = typeColors[n.type] ?? '#6B7280';
            return (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.isRead) onMarkAsRead(n.id);
                  onNavigate();
                  onClose();
                }}
                className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-0"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: n.isRead ? '#F4F4F6' : color + '15' }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: n.isRead ? '#9CA3AF' : color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-semibold line-clamp-1 ${n.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: color }} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
