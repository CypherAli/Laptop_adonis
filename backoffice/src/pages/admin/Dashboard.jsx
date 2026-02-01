import React from 'react'
import { Head } from '@inertiajs/react'

/**
 * Admin Dashboard - Inertia Page Component
 * Props được truyền tự động từ Controller
 */
export default function Dashboard({ stats, recentOrders }) {
  return (
    <>
      <Head title="Admin Dashboard" />
      
      <div className="admin-dashboard">
        <h1>Dashboard Admin</h1>
        
        {/* Stats cards */}
        <div className="stats-grid">
          {stats && Object.entries(stats).map(([key, value]) => (
            <div key={key} className="stat-card">
              <h3>{key}</h3>
              <p>{value}</p>
            </div>
          ))}
        </div>
        
        {/* Recent orders */}
        <div className="recent-orders">
          <h2>Đơn hàng gần đây</h2>
          {recentOrders?.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.user?.username}</td>
                    <td>{order.totalAmount?.toLocaleString()}đ</td>
                    <td>{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Chưa có đơn hàng nào</p>
          )}
        </div>
      </div>
    </>
  )
}
