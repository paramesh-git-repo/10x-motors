import { Outlet } from 'react-router-dom'
import SideBar from './SideBar'
import TopNav from './TopNav'

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 print:h-auto print:overflow-visible">
      <SideBar />
      <div className="flex flex-col flex-1 overflow-hidden print:w-full">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

