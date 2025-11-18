import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import './Auth.css'

export const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password)
      setSuccess(true)
      toast.success('Account created successfully!', {
        description: 'Please check your email to verify your account'
      })
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      toast.error('Failed to create account', {
        description: err.message || 'Please try again'
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Check your email!</h2>
          <p>We've sent you a confirmation link. Please verify your email to continue.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>GeoPhoto</h1>
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              minLength={6}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
