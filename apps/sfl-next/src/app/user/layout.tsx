import { ReactNode } from 'react';
import '../global.css';
import Navbar from '../../components/Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
        <header>
          <Navbar />
        </header>
        <div>
            <main>{children}</main>
        </div>
    </>
  );
};

export default Layout;