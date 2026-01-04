export default function SimpleApp() {
  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        color: '#333', 
        fontSize: '32px', 
        marginBottom: '20px',
        textAlign: 'left'
      }}>
        🚀 Techo Lanka CCTV Management
      </h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '15px', textAlign: 'left' }}>System Status</h2>
        <p style={{ color: '#666', textAlign: 'left' }}>✅ React is loaded and working</p>
        <p style={{ color: '#666', textAlign: 'left' }}>✅ Application is rendering correctly</p>
        <p style={{ color: '#666', textAlign: 'left' }}>✅ Styles are being applied</p>
      </div>

      <div style={{ 
        backgroundColor: '#e8f5e8', 
        padding: '20px', 
        borderRadius: '8px',
        border: '2px solid #4CAF50'
      }}>
        <p style={{ color: '#333', margin: '0', textAlign: 'left', fontWeight: 'bold' }}>
          If you can see this page, the basic application setup is working correctly!
        </p>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <button 
          style={{ 
            backgroundColor: '#007bff', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
          onClick={() => window.location.href = '/login'}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
