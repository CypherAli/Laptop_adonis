import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMapPin, FiClock, FiDollarSign, FiSend } from 'react-icons/fi'
import './CareersPage.css'

const CareersPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    cv: null,
    coverLetter: '',
  })

  const jobOpenings = [
    {
      id: 1,
      title: 'Senior React Developer',
      department: 'Technology',
      location: 'Hà Nội',
      type: 'Full-time',
      salary: '20-35 triệu',
      description:
        'Phát triển và maintain các ứng dụng web với React.js, làm việc với team năng động.',
      requirements: [
        '3+ năm kinh nghiệm React.js',
        'Thành thạo JavaScript ES6+, Redux, React Hooks',
        'Hiểu biết về RESTful APIs, Git',
        'Có khả năng làm việc nhóm tốt',
      ],
    },
    {
      id: 2,
      title: 'Backend NodeJS Developer',
      department: 'Technology',
      location: 'Hà Nội / Remote',
      type: 'Full-time',
      salary: '18-30 triệu',
      description: 'Xây dựng và tối ưu hệ thống backend với Node.js, Express, MongoDB.',
      requirements: [
        '2+ năm kinh nghiệm Node.js',
        'Thành thạo Express, MongoDB, RESTful API',
        'Hiểu biết về microservices, Docker',
        'Có kinh nghiệm với cloud services (AWS/GCP)',
      ],
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Hà Nội',
      type: 'Full-time',
      salary: '15-25 triệu',
      description: 'Thiết kế giao diện người dùng đẹp mắt và trải nghiệm người dùng tối ưu.',
      requirements: [
        '2+ năm kinh nghiệm UI/UX Design',
        'Thành thạo Figma, Adobe XD, Photoshop',
        'Hiểu biết về design thinking, user research',
        'Portfolio ấn tượng',
      ],
    },
    {
      id: 4,
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Hà Nội',
      type: 'Full-time',
      salary: '20-30 triệu',
      description: 'Xây dựng và thực thi chiến lược marketing, quảng bá thương hiệu.',
      requirements: [
        '3+ năm kinh nghiệm Marketing',
        'Hiểu biết về digital marketing, SEO, SEM',
        'Có kinh nghiệm với Facebook Ads, Google Ads',
        'Tư duy sáng tạo, phân tích tốt',
      ],
    },
    {
      id: 5,
      title: 'Customer Service Representative',
      department: 'Customer Support',
      location: 'Hà Nội / Hồ Chí Minh',
      type: 'Full-time',
      salary: '10-15 triệu',
      description: 'Chăm sóc khách hàng, giải đáp thắc mắc, hỗ trợ bán hàng.',
      requirements: [
        'Có kinh nghiệm customer service ưu tiên',
        'Kỹ năng giao tiếp tốt',
        'Nhiệt tình, trách nhiệm',
        'Có thể làm việc theo ca',
      ],
    },
    {
      id: 6,
      title: 'Sales Executive',
      department: 'Sales',
      location: 'Toàn quốc',
      type: 'Full-time',
      salary: '12-20 triệu + Hoa hồng',
      description: 'Tư vấn và bán hàng trực tiếp, chăm sóc khách hàng doanh nghiệp.',
      requirements: [
        '1+ năm kinh nghiệm bán hàng',
        'Kỹ năng thuyết trình, đàm phán tốt',
        'Năng động, chịu được áp lực',
        'Hiểu biết về sản phẩm công nghệ',
      ],
    },
  ]

  const benefits = [
    { icon: '💰', title: 'Lương cạnh tranh', desc: 'Mức lương hấp dẫn + thưởng hiệu suất' },
    {
      icon: '🏥',
      title: 'Bảo hiểm đầy đủ',
      desc: 'BHXH, BHYT, BHTN theo luật + Bảo hiểm sức khỏe',
    },
    { icon: '🌴', title: '14 ngày phép/năm', desc: 'Nghỉ phép năm, nghỉ lễ theo quy định' },
    { icon: '📚', title: 'Đào tạo liên tục', desc: 'Khóa học online, workshop, conference' },
    { icon: '🎉', title: 'Team building', desc: 'Du lịch, party, event hàng quý' },
    { icon: '⏰', title: 'Làm việc linh hoạt', desc: 'Flexible time, work from home' },
    { icon: '🚀', title: 'Thăng tiến', desc: 'Lộ trình thăng tiến rõ ràng' },
    { icon: '☕', title: 'Môi trường tốt', desc: 'Văn phòng hiện đại, snack & drink free' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Cảm ơn bạn đã ứng tuyển! Chúng tôi sẽ liên hệ sớm nhất.')
  }

  return (
    <div className="careers-page">
      {/* Hero */}
      <motion.section className="careers-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="careers-hero-content">
          <motion.h1
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            🚀 Tuyển Dụng
          </motion.h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Tham gia đội ngũ Laptop Store Vietnam - Nơi tài năng được trân trọng
          </motion.p>
        </div>
      </motion.section>

      {/* Why Work With Us */}
      <section className="careers-why">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            💼 Vì sao làm việc cùng chúng tôi?
          </motion.h2>
          <motion.p
            className="careers-subtitle"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Laptop Store Vietnam là nơi bạn có thể phát triển sự nghiệp, làm việc với những con
            người tài năng và đam mê công nghệ
          </motion.p>
        </div>
      </section>

      {/* Benefits */}
      <section className="careers-benefits">
        <div className="container">
          <h2>🎁 Quyền lợi nhân viên</h2>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="benefit-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <div className="benefit-icon">{benefit.icon}</div>
                <h4>{benefit.title}</h4>
                <p>{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section className="careers-jobs">
        <div className="container">
          <h2>📢 Vị trí đang tuyển</h2>
          <div className="jobs-list">
            {jobOpenings.map((job, index) => (
              <motion.div
                key={job.id}
                className="job-card"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="job-header">
                  <div>
                    <h3>{job.title}</h3>
                    <span className="job-department">{job.department}</span>
                  </div>
                  <button className="job-apply-btn">Ứng tuyển</button>
                </div>

                <div className="job-meta">
                  <span>
                    <FiMapPin /> {job.location}
                  </span>
                  <span>
                    <FiClock /> {job.type}
                  </span>
                  <span>
                    <FiDollarSign /> {job.salary}
                  </span>
                </div>

                <p className="job-description">{job.description}</p>

                <div className="job-requirements">
                  <strong>Yêu cầu:</strong>
                  <ul>
                    {job.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="careers-form">
        <div className="container">
          <motion.div
            className="form-wrapper"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2>📝 Nộp đơn ứng tuyển</h2>
            <p>
              Điền thông tin bên dưới hoặc gửi CV về email: <strong>careers@laptopstore.vn</strong>
            </p>

            <form onSubmit={handleSubmit} className="application-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input type="text" required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input type="tel" required />
                </div>
                <div className="form-group">
                  <label>Vị trí ứng tuyển *</label>
                  <select required>
                    <option value="">Chọn vị trí</option>
                    {jobOpenings.map((job) => (
                      <option key={job.id} value={job.title}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Kinh nghiệm (năm)</label>
                <input type="number" min="0" max="50" />
              </div>

              <div className="form-group">
                <label>CV đính kèm *</label>
                <input type="file" accept=".pdf,.doc,.docx" required />
              </div>

              <div className="form-group">
                <label>Thư giới thiệu</label>
                <textarea rows="5" placeholder="Giới thiệu ngắn về bản thân..."></textarea>
              </div>

              <button type="submit" className="submit-btn">
                <FiSend /> Gửi đơn ứng tuyển
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default CareersPage
