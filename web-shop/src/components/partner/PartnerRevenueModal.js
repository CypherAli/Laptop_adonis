import React, { useState, useEffect } from 'react'
import axios from '../../api/axiosConfig'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { FiX, FiDollarSign, FiShoppingBag, FiPackage, FiTrendingUp } from 'react-icons/fi'
import './PartnerRevenueModal.css'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
)

const PartnerRevenueModal = ({ partnerId, onClose }) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchPartnerRevenue()
  }, [partnerId])

  const fetchPartnerRevenue = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/admin/partners/${partnerId}/revenue`)
      setData(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching partner revenue:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="partner-revenue-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-loading">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="partner-revenue-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-error">
            <p>Không thể tải dữ liệu</p>
            <button onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>
    )
  }

  // Chart data for brand revenue (Bar chart)
  const brandRevenueData = {
    labels: data.brandRevenue.map((b) => b.brand),
    datasets: [
      {
        label: 'Doanh thu (VND)',
        data: data.brandRevenue.map((b) => b.revenue),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  // Chart data for brand revenue (Doughnut chart)
  const brandDoughnutData = {
    labels: data.brandRevenue.map((b) => b.brand),
    datasets: [
      {
        label: 'Tỷ trọng doanh thu',
        data: data.brandRevenue.map((b) => b.revenue),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: '#fff',
        borderWidth: 3,
      },
    ],
  }

  // Chart data for monthly revenue (Line chart)
  const monthlyRevenueData = {
    labels: data.monthlyRevenue.map((m) => {
      const [year, month] = m.month.split('-')
      return `T${month}/${year}`
    }),
    datasets: [
      {
        label: 'Doanh thu theo tháng',
        data: data.monthlyRevenue.map((m) => m.revenue),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: "'Segoe UI', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            label += context.parsed.y.toLocaleString('vi-VN') + ' VND'
            return label
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return value.toLocaleString('vi-VN')
          },
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12,
            family: "'Segoe UI', sans-serif",
          },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function (context) {
            const label = context.label || ''
            const value = context.parsed.toLocaleString('vi-VN')
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${label}: ${value} VND (${percentage}%)`
          },
        },
      },
    },
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="partner-revenue-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-info">
            <h2>{data.partner.shopName}</h2>
            <p className="partner-username">
              @{data.partner.username} • {data.partner.email}
            </p>
            <span className={`approval-badge ${data.partner.isApproved ? 'approved' : 'pending'}`}>
              {data.partner.isApproved ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="summary-grid">
          <div className="summary-card revenue">
            <div className="card-icon">
              <FiDollarSign />
            </div>
            <div className="card-content">
              <span className="label">Tổng doanh thu</span>
              <span className="value">{data.summary.totalRevenue.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
          <div className="summary-card sold">
            <div className="card-icon">
              <FiShoppingBag />
            </div>
            <div className="card-content">
              <span className="label">Đã bán</span>
              <span className="value">{data.summary.totalSoldCount} sản phẩm</span>
            </div>
          </div>
          <div className="summary-card products">
            <div className="card-icon">
              <FiPackage />
            </div>
            <div className="card-content">
              <span className="label">Sản phẩm</span>
              <span className="value">
                {data.summary.activeProducts}/{data.summary.totalProducts}
              </span>
            </div>
          </div>
          <div className="summary-card average">
            <div className="card-icon">
              <FiTrendingUp />
            </div>
            <div className="card-content">
              <span className="label">Trung bình/sản phẩm</span>
              <span className="value">
                {data.summary.totalSoldCount > 0
                  ? Math.round(
                      data.summary.totalRevenue / data.summary.totalSoldCount
                    ).toLocaleString('vi-VN')
                  : 0}{' '}
                đ
              </span>
            </div>
          </div>
        </div>

        {/* Modal Content - Charts */}
        <div className="modal-content">
          {/* Monthly Revenue Trend */}
          {data.monthlyRevenue && data.monthlyRevenue.length > 0 && (
            <div className="chart-section full-width">
              <h3>📈 Xu hướng doanh thu 6 tháng gần đây</h3>
              <div className="chart-container" style={{ height: '300px' }}>
                <Line data={monthlyRevenueData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Brand Revenue Charts */}
          {data.brandRevenue && data.brandRevenue.length > 0 && (
            <div className="chart-row">
              <div className="chart-section">
                <h3>🏢 Doanh thu theo hãng (Biểu đồ cột)</h3>
                <div className="chart-container" style={{ height: '350px' }}>
                  <Bar data={brandRevenueData} options={chartOptions} />
                </div>
              </div>
              <div className="chart-section">
                <h3>📊 Tỷ trọng doanh thu theo hãng</h3>
                <div className="chart-container" style={{ height: '350px' }}>
                  <Doughnut data={brandDoughnutData} options={doughnutOptions} />
                </div>
              </div>
            </div>
          )}

          {/* Best Sellers Table */}
          {data.bestSellers && data.bestSellers.length > 0 && (
            <div className="chart-section full-width">
              <h3>🏆 Top 10 sản phẩm bán chạy nhất</h3>
              <div className="best-sellers-table">
                <table>
                  <thead>
                    <tr>
                      <th>Hạng</th>
                      <th>Sản phẩm</th>
                      <th>Hãng</th>
                      <th>Giá</th>
                      <th>Đã bán</th>
                      <th>Tồn kho</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bestSellers.map((product, index) => (
                      <tr key={index}>
                        <td className="rank">#{index + 1}</td>
                        <td className="product-name">{product.name}</td>
                        <td>
                          <span className="brand-badge">{product.brand}</span>
                        </td>
                        <td className="price">{product.price.toLocaleString('vi-VN')} đ</td>
                        <td className="sold-count">
                          <strong>{product.soldCount}</strong>
                        </td>
                        <td className={!product.stock || product.stock <= 0 ? 'out-of-stock' : ''}>
                          {product.stock}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}
                          >
                            {product.isActive ? 'Hoạt động' : 'Tạm dừng'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {(!data.brandRevenue || data.brandRevenue.length === 0) && (
            <div className="no-data-message">
              <p>📊 Chưa có dữ liệu doanh thu cho partner này</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PartnerRevenueModal
