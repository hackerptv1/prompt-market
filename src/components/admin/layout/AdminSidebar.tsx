import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ShoppingBag,
  MessageSquare,
  Settings,
  Shield,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Calendar,
  Cpu,
  FolderTree,
  Image,
  Package,
  ImageIcon
} from 'lucide-react';

export function AdminSidebar() {
  const navItems = [
    { icon: <LayoutDashboard />, label: 'Dashboard', path: '/admin' },
    { icon: <Users />, label: 'Users', path: '/admin/users' },
    { icon: <FileText />, label: 'Prompts', path: '/admin/prompts' },
    { icon: <Cpu />, label: 'AI Providers', path: '/admin/ai-providers' },
    { icon: <ImageIcon />, label: 'Platforms', path: '/admin/platforms' },
    { icon: <FolderTree />, label: 'Categories', path: '/admin/categories' },
    { icon: <Package />, label: 'Packages', path: '/admin/packages' },
    { icon: <Image />, label: 'Media', path: '/admin/media' },
    { icon: <ShoppingBag />, label: 'Orders', path: '/admin/orders' },
    { icon: <Calendar />, label: 'Bookings', path: '/admin/bookings' },
    { icon: <MessageSquare />, label: 'Reviews', path: '/admin/reviews' },
    { icon: <DollarSign />, label: 'Payments', path: '/admin/payments' },
    { icon: <BarChart3 />, label: 'Analytics', path: '/admin/analytics' },
    { icon: <Shield />, label: 'Moderation', path: '/admin/moderation' },
    { icon: <AlertTriangle />, label: 'Reports', path: '/admin/reports' },
    { icon: <Settings />, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}