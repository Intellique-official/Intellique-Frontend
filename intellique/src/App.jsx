import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import SignUp from "./pages/SignUp"
import SignIn from "./pages/SignIn"
import ForgottenPassword from './pages/ForgotPassword'
import ResetPassword from "./pages/ResetPassword"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />}></Route>
        <Route path="/SignUp" element={<SignUp />}></Route>
        <Route path="/SignIn" element={<SignIn />}></Route>
        <Route path="/forgot-password" element={<ForgottenPassword />}></Route>
        <Route path="/ResetPassword" element={<ResetPassword />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
