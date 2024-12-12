import React, { useContext }  from 'react'
import {Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.js'
import Home from './../pages/Home';
import Tours from './../pages/Tours';
import TourDetails from './../pages/TourDetails';
import Login from './../pages/Login';
import Register from './../pages/Register';
import SearchResultList from './../pages/SearchResultList';
import ThankYou from '../pages/ThankYou';
import About from '../pages/About';
import Admin from '../pages/Admin';

const Routers = () => {
  const { user } = useContext(AuthContext);

  const PrivateRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };
  const PrivateAdminRoute = ({ children }) => {
    if (!user || user.email !== 'goelmedha05@gmail.com') {
      return <Navigate to="/login" />;
    }
    return children;
  };
  return (
    <Routes>
        <Route path='/' element={<Navigate to='/home'/>}/>
        <Route path='/home' element={<Home/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/tours' element={<Tours/>}/>
        <Route path='/tours/:id' element={<PrivateRoute>
            <TourDetails/>
          </PrivateRoute>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/admin' element={<PrivateAdminRoute>
            <Admin/>
          </PrivateAdminRoute>}/>
        <Route path='/thank-you' element={<ThankYou/>}/>
        <Route path='/tours/search' element={<SearchResultList/>}/>
    </Routes>
  )
}

export default Routers