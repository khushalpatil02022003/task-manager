import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar-glass">
      <div className="nav-container">
        <div className="nav-logo">
          <span className="logo-icon">✔</span>
          <span className="logo-text">TaskSphere</span>
        </div>
        
        {user && (
          <div className="nav-actions">
            <span className="user-email" title={user.email}>
              👤 {user.email}
            </span>
            <button className="btn btn-outline btn-sm" onClick={logout}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
