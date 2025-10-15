import { useMemo, useState } from 'react'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import image1 from '../assets/image1.png'
import RegisterPage from './RegisterPage'
import LoginPage from './LoginPage'

const AuthPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const initialMode = useMemo(() => (location.pathname.includes('register') ? 'register' : 'login'), [location.pathname])
  const [mode, setMode] = useState(initialMode) // 'login' | 'register'
  const [isSliding, setIsSliding] = useState(false)
  const [slideTarget, setSlideTarget] = useState('left') // 'left' | 'right'

  const switchTo = (target) => {
    // While sliding, cover the CURRENT form
    setSlideTarget(mode === 'register' ? 'right' : 'left')
    setIsSliding(true)
    setTimeout(() => {
      setMode(target)
      navigate(target === 'login' ? '/login' : '/register', { replace: true })
      setIsSliding(false)
    }, 450)
  }

  const isLogin = mode === 'login'

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50 to-teal-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.5 }} 
          className="mb-1"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-700 transition-colors">
            <ArrowLeftOutlined />
            <span>Quay lại trang chủ</span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden grid md:grid-cols-2 md:h-[640px]">
          <motion.div
            initial={{ x: isLogin ? '100%' : '0%' }}
            animate={{ x: isSliding ? (slideTarget === 'left' ? '0%' : '100%') : (isLogin ? '100%' : '0%') }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 z-10 hidden md:block over"
          >
            <div className="relative h-full w-full will-change-transform">
              <img src={image1} alt="TutorLink illustration" className="h-full w-full" />
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-blue-500/10 to-teal-500/10" />
              <div className="absolute inset-0 ring-1 ring-black/5" />
            </div>
          </motion.div>

          {/* Login form */}
          <LoginPage switchTo={switchTo} />

          {/* Register form */}
          <RegisterPage switchTo={switchTo} />
        </motion.div>
      </div>
    </div>
  )
}

export default AuthPage


