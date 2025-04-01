import React from 'react'
import Login from './components/Login'
import { BrowserRouter,Routes, Route } from 'react-router-dom'

export default function App() {
  console.log(process.env.REACT_APP_API_KEY);
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
