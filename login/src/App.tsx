import React from 'react'
import Header from './components/Header'
import LoginSection from './components/LoginSection'
import './App.css'

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <LoginSection />
      </main>
    </div>
  )
}

export default App
