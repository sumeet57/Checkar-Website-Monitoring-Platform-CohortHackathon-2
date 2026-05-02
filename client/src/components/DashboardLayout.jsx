import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const DashboardLayout = ({children}) => {
  return (
    <div>
        <Sidebar/>
        <Outlet>
            {children}
        </Outlet>
    </div>
  )
}

export default DashboardLayout