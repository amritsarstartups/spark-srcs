import { ReactNode } from 'react';
import '../global.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
