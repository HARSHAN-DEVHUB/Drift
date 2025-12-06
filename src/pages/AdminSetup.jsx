import React, { useState } from 'react';
import { ref as dbRef, set, get } from 'firebase/database';
import { database, auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Admin Setup Component
 * This is a one-time setup component to add admin role to users in Realtime Database
 * After setup is complete, you can remove this component
 */
const AdminSetup = () => {
  const [uid, setUid] = useState('');
  const [email, setEmail] = useState('admin@drift.com');
  const [fullName, setFullName] = useState('Admin User');
  const [username, setUsername] = useState('admin');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSetupAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Use current user's UID if logged in and no UID provided
      const targetUid = uid || (user ? user.uid : '');
      
      if (!targetUid) {
        setMessage('❌ Please provide a User UID or login first');
        setLoading(false);
        return;
      }

      // Create/update user in Realtime Database
      const userRef = dbRef(database, `users/${targetUid}`);
      await set(userRef, {
        email: email,
        fullName: fullName,
        username: username,
        role: 'admin',
        createdAt: Date.now()
      });

      setMessage(`✅ Success! Admin user created for UID: ${targetUid}`);
      console.log('✅ Admin user added to Realtime Database:', targetUid);
      
      // Clear form
      setUid('');
    } catch (error) {
      console.error('Error setting up admin:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentUser = () => {
    if (user) {
      setUid(user.uid);
      setEmail(user.email);
      setMessage(`Using current logged-in user: ${user.email}`);
    } else {
      setMessage('❌ No user is currently logged in');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔧 Admin Setup</h1>
        <p style={styles.subtitle}>Add admin role to a user in Realtime Database</p>

        {user && (
          <div style={styles.infoBox}>
            <p><strong>Currently logged in as:</strong></p>
            <p>{user.email}</p>
            <p><strong>UID:</strong> {user.uid}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <button 
              type="button" 
              onClick={handleUseCurrentUser}
              style={styles.secondaryButton}
            >
              Use Current User
            </button>
          </div>
        )}

        <form onSubmit={handleSetupAdmin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>User UID (from Firebase Auth Console)</label>
            <input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="Paste User UID here"
              style={styles.input}
            />
            <small style={styles.helpText}>
              Get this from Firebase Console → Authentication → Users
            </small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{...styles.button, opacity: loading ? 0.6 : 1}}
          >
            {loading ? '⏳ Setting up...' : '✅ Create Admin User'}
          </button>
        </form>

        {message && (
          <div style={{
            ...styles.message,
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            borderColor: message.includes('✅') ? '#c3e6cb' : '#f5c6cb'
          }}>
            {message}
          </div>
        )}

        <div style={styles.instructions}>
          <h3>📋 Instructions:</h3>
          <ol>
            <li>Create a user in Firebase Console → Authentication → Add User</li>
            <li>Copy the User UID from the users list</li>
            <li>Paste the UID above and fill in the details</li>
            <li>Click "Create Admin User"</li>
            <li>Login with the credentials</li>
            <li>Access admin dashboard at /admin/products</li>
          </ol>
        </div>

        <div style={styles.warning}>
          ⚠️ <strong>Security Note:</strong> Remove this component after setting up your admin user!
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(231, 29, 54, 0.3)'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#e71d36',
    marginBottom: '10px',
    textAlign: 'center'
  },
  subtitle: {
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px'
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    border: '2px solid #e71d36',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '600',
    color: '#1a1a1a',
    fontSize: '14px'
  },
  input: {
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.3s',
    outline: 'none'
  },
  helpText: {
    color: '#666',
    fontSize: '12px'
  },
  button: {
    backgroundColor: '#e71d36',
    color: '#ffffff',
    padding: '14px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginTop: '10px'
  },
  secondaryButton: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px'
  },
  message: {
    padding: '15px',
    borderRadius: '6px',
    marginTop: '20px',
    border: '1px solid',
    fontWeight: '500'
  },
  instructions: {
    backgroundColor: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '30px',
    borderLeft: '4px solid #e71d36'
  },
  warning: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    color: '#856404',
    padding: '15px',
    borderRadius: '6px',
    marginTop: '20px',
    textAlign: 'center'
  }
};

export default AdminSetup;
