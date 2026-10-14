import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Menu from '../components/Menu';

export default function MainLayout({ children }) {
  const [menuVisible, setMenuVisible] = useState(true);

  return (
    <div className="layout-wrapper">
      <Header onClickMenu={() => setMenuVisible(!menuVisible)} />

      <div className="body">
        <Menu visible={menuVisible} />
        <main className="main-content">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}