import React from 'react';
import StudentInfo from './components/StudentInfo';
import './App.css';

/**
 * The main App component.
 * This component acts as the root of your application,
 * setting up the main layout and rendering the StudentInfo component.
 */
function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Responsive Student Card</h1>
        <p>Resize the browser window to see the layout change.</p>
      </header>
      <main>
        {/* You can reuse the component multiple times */}
        <StudentInfo />
      </main>
    </div>
  );
}

export default App;
