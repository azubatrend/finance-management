import React, { useState, useEffect } from 'react';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Home');
  const [transactions, setTransactions] = useState([]);
  
  // Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Expense');
  const [category, setCategory] = useState('Food');
  const [reason, setReason] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-time Data Fetching
  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        orderBy("date", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setTransactions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleSave = async () => {
    if (!amount || !reason) return alert("Please fill all fields!");

    const data = {
      amount: parseFloat(amount),
      type,
      category,
      reason,
      date: new Date().toISOString(),
      userId: user.uid
    };

    try {
      if (editId) {
        await updateDoc(doc(db, "transactions", editId), data);
        setEditId(null);
      } else {
        await addDoc(collection(db, "transactions"), data);
      }
      resetForm();
    } catch (err) { console.error(err); }
  };

  const deleteTransaction = async (id) => {
    if (window.confirm("Delete karna chahte ho?")) {
      await deleteDoc(doc(db, "transactions", id));
    }
  };

  const startEdit = (t) => {
    setEditId(t.id);
    setAmount(t.amount);
    setType(t.type);
    setCategory(t.category);
    setReason(t.reason);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setAmount(''); setReason(''); setEditId(null); setIsModalOpen(false);
  };

  // Calculations
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);

  if (loading) return <div className="login-wrapper"><h2>Loading...</h2></div>;
  if (!user) return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1>Azuba Finance</h1>
        <button className="google-btn" onClick={() => signInWithPopup(auth, googleProvider)}>
          Continue with Google
        </button>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <header className="header">
        <span>Hi, {user.displayName.split(" ")[0]}</span>
        <button className="logout-btn" onClick={() => signOut(auth)}>Logout</button>
      </header>

      <main className="main-content">
        {activeTab === 'Home' && (
          <>
            <div className="dashboard-summary">
              <div className="card"><h3>Income</h3><p className="amount text-green">₹{totalIncome}</p></div>
              <div className="card"><h3>Expenses</h3><p className="amount text-red">₹{totalExpense}</p></div>
              <div className="card" style={{gridColumn: 'span 2'}}>
                <h3>Balance</h3><p className="amount text-blue">₹{totalIncome - totalExpense}</p>
              </div>
            </div>
            
            <div style={{padding: '1rem'}}>
              <h4>Recent Transactions</h4>
              {transactions.map(t => (
                <div key={t.id} className="card" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px', textAlign: 'left'}}>
                  <div>
                    <strong>{t.reason}</strong> <br/>
                    <small>{t.category} | {new Date(t.date).toLocaleDateString()}</small>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <span className={t.type === 'Income' ? 'text-green' : 'text-red'}>
                      {t.type === 'Income' ? '+' : '-'}₹{t.amount}
                    </span>
                    <br/>
                    <button onClick={() => startEdit(t)} style={{marginRight: '5px', border: 'none', background: 'none', cursor: 'pointer'}}>✏️</button>
                    <button onClick={() => deleteTransaction(t.id)} style={{border: 'none', background: 'none', cursor: 'pointer'}}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <button className="floating-btn" onClick={() => setIsModalOpen(true)}>+</button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editId ? 'Edit Record' : 'Add Record'}</h2>
            <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
            <input type="number" className="form-control" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Food</option><option>Travel</option><option>Shopping</option><option>Side Job</option><option>Other</option>
            </select>
            <input type="text" className="form-control" placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            <button className="submit-btn" style={{backgroundColor: type === 'Income' ? 'var(--color-green)' : 'var(--color-red)'}} onClick={handleSave}>
              {editId ? 'Update' : 'Save'}
            </button>
            <button onClick={resetForm} style={{width: '100%', background: 'none', border: 'none', marginTop: '10px', cursor: 'pointer'}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;