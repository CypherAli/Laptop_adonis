import React, { createContext, useState, useEffect, useContext } from 'react'
import axios from '../api/axiosConfig'
import AuthContext from './AuthContext'

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext)
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(false)

  // Load wishlist on mount and when user changes
  useEffect(() => {
    if (user) {
      // Admin không có wishlist
      if (user.role === 'admin') {
        setWishlist([])
        localStorage.removeItem('wishlist')
        return
      }
      // Load from API if logged in
      loadWishlistFromAPI()
    } else {
      // Load from localStorage if not logged in
      loadWishlistFromLocalStorage()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Load from localStorage (for guest users)
  const loadWishlistFromLocalStorage = () => {
    try {
      const savedWishlist = localStorage.getItem('wishlist')
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist)
        if (Array.isArray(parsedWishlist)) {
          setWishlist(parsedWishlist)
        } else {
          console.warn('Invalid wishlist data in localStorage')
          localStorage.removeItem('wishlist')
        }
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error)
      localStorage.removeItem('wishlist')
    }
  }

  // Load from API (for logged in users)
  const loadWishlistFromAPI = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/user/wishlist')
      const apiWishlist = response.data.map((item) => ({
        ...item.product, // Spread all product fields including variants
        addedAt: item.addedAt,
      }))
      setWishlist(apiWishlist)

      // Sync to localStorage
      localStorage.setItem('wishlist', JSON.stringify(apiWishlist))
    } catch (error) {
      console.error('Failed to load wishlist from API:', error)
      // Fallback to localStorage
      loadWishlistFromLocalStorage()
    } finally {
      setLoading(false)
    }
  }

  // Save wishlist to localStorage whenever it changes (for guest users)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist))
    }
  }, [wishlist, user])

  // Add product to wishlist
  const addToWishlist = async (product) => {
    if (user) {
      // Add to API
      try {
        await axios.post('/user/wishlist', { productId: product._id })
        setWishlist((prev) => [
          ...prev,
          {
            ...product, // Spread all product data
            addedAt: new Date().toISOString(),
          },
        ])
      } catch (error) {
        console.error('Failed to add to wishlist:', error)
        throw error
      }
    } else {
      // Add to localStorage
      setWishlist((prev) => {
        if (prev.find((item) => item._id === product._id)) {
          return prev
        }
        return [
          ...prev,
          {
            ...product, // Spread all product data
            addedAt: new Date().toISOString(),
          },
        ]
      })
    }
  }

  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    if (user) {
      // Remove from API
      try {
        await axios.delete(`/user/wishlist/${productId}`)
        setWishlist((prev) => prev.filter((item) => item._id !== productId))
      } catch (error) {
        console.error('Failed to remove from wishlist:', error)
        throw error
      }
    } else {
      // Remove from localStorage
      setWishlist((prev) => prev.filter((item) => item._id !== productId))
    }
  }

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item._id === productId)
  }

  // Toggle wishlist (add if not exists, remove if exists)
  const toggleWishlist = async (product) => {
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id)
      } else {
        await addToWishlist(product)
      }
    } catch (error) {
      console.error('Toggle wishlist error:', error)
    }
  }

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlist([])
    localStorage.removeItem('wishlist')
  }

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export default WishlistContext
