import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <MainContent>
          {children}
        </MainContent>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
