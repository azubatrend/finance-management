import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase'; // Firebase connection
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null); // User state
  const [activeTab, setActiveTab] = useState('Home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryType, setEntryType] = useState('Expense');
  const [loading, setLoading] = useState(true);

  // Background listener to check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Google Login Function
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login me problem aayi, try again!");
    }
  };

  // Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Loading Screen (While checking auth state)
  if (loading) {
    return <div className="login-wrapper"><h2>Loading Azuba Finance...</h2></div>;
  }

  // LOGIN SCREEN (If user is not logged in)
  if (!user) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <h1>Azuba Finance</h1>
          <p>Track your daily income, expenses, and savings securely.</p>
          <button className="google-btn" onClick={handleLogin}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  // MAIN APP DASHBOARD (If user is logged in)
  return (
    <div className="app-container">
      {/* Header with User Info & Logout */}
      <header className="header">
        <span style={{ fontSize: '1rem' }}>Hi, {user.displayName.split(" ")[0]}</span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <main className="main-content">
        {activeTab === 'Home' && (
          <div className="dashboard-summary">
            <div className="card"><h3>Main Cash</h3><p className="amount text-black">₹192</p></div>
            <div className="card"><h3>Main Online</h3><p className="amount text-blue">₹2,260</p></div>
            <div className="card"><h3>Income</h3><p className="amount text-green">₹9,952</p></div>
            <div className="card"><h3>Expenses</h3><p className="amount text-red">₹7,550</p></div>
          </div>
        )}
        {activeTab === 'History' && <div style={{padding: '1.5rem', textAlign: 'center', color: '#6b7280'}}>History Module Coming Soon...</div>}
      </main>

      <button className="floating-btn" onClick={() => setIsModalOpen(true)}>+</button>

      <nav className="bottom-nav">
        <div className={`nav-item ${activeTab === 'Home' ? 'active' : ''}`} onClick={() => setActiveTab('Home')}>Home</div>
        <div className={`nav-item ${activeTab === 'History' ? 'active' : ''}`} onClick={() => setActiveTab('History')}>History</div>
      </nav>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Record</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>✖</button>
            </div>
            <div className="form-group">
              <label>Transaction Type</label>
              <select className="form-control" value={entryType} onChange={(e) => setEntryType(e.target.value)}>
                <option value="Expense">Expense (Kharcha)</option>
                <option value="Income">Income (Kamai)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input type="number" className="form-control" placeholder="e.g. 500" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control">
                <option>Food</option>
                <option>Travel</option>
                <option>Shopping</option>
                <option>Side Job</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Reason / Note</label>
              <input type="text" className="form-control" placeholder="Brief reason..." />
            </div>
            <button 
              className="submit-btn" 
              style={{ backgroundColor: entryType === 'Income' ? 'var(--color-green)' : 'var(--color-red)' }}
              onClick={() => alert(`Saving to ${user.email}'s account soon!`)}
            >
              Save Record
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;