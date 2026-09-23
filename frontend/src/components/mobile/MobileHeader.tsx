import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Search, Bell, Bot, Compass } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBack,
  onOpenSearch,
  onOpenNotifications,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const isSubRoute = showBack || (location.pathname.startsWith('/m/') && location.pathname !== '/m');

  return (
    <header className="mobile-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        {isSubRoute ? (
          <button
            className="mobile-header-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Compass size={20} />
          </div>
        )}

        <div className="mobile-header-title">
          <span>{title || 'Maritime Intelligence'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          className="mobile-header-btn"
          onClick={() => navigate('/m/skipper')}
          title="Skipper AI"
          aria-label="Skipper AI"
          style={{ color: '#38bdf8' }}
        >
          <Bot size={19} />
        </button>

        {onOpenSearch && (
          <button
            className="mobile-header-btn"
            onClick={onOpenSearch}
            aria-label="Open search"
          >
            <Search size={18} />
          </button>
        )}

        {onOpenNotifications && (
          <button
            className="mobile-header-btn"
            onClick={onOpenNotifications}
            aria-label="Notifications"
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 0 6px rgba(239,68,68,0.5)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
