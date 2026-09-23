import { Topbar } from './Topbar';

export { Topbar };

// Keep Header for backward-compatibility with any legacy imports
export function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  return <Topbar onOpenMobile={onOpenMobile} onOpenSearch={() => {}} />;
}
