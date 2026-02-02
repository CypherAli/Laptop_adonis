import mongoose, { Schema, Document, Types } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface UserDocument extends Document {
  username: string
  email: string
  password: string
  role: 'client' | 'partner' | 'admin'
  shopName?: string
  shopDescription?: string
  isApproved: boolean
  phone?: string
  avatar?: string
  isActive: boolean
  address?: string
  description?: string
  businessType?: string
  taxCode?: string
  bankAccount?: string
  bankName?: string
  notificationSettings?: {
    emailNotifications?: boolean
    orderNotifications?: boolean
    promotionNotifications?: boolean
    systemNotifications?: boolean
  }
  storeSettings?: {
    autoApproveOrders?: boolean
    minOrderAmount?: number
    freeShippingThreshold?: number
    workingHours?: {
      start?: string
      end?: string
    }
    workingDays?: string[]
  }
  addresses?: Array<{
    label: 'home' | 'office' | 'other'
    fullName?: string
    phone?: string
    address: {
      street?: string
      ward?: string
      district?: string
      city?: string
      zipCode?: string
    }
    isDefault: boolean
    createdAt?: Date
  }>
  paymentMethods?: Array<{
    type: 'card' | 'bank' | 'ewallet'
    provider?: string
    lastFourDigits?: string
    accountName?: string
    expiryDate?: string
    isDefault: boolean
  }>
  wishlist?: Types.ObjectId[]
  orderHistory?: Types.ObjectId[]
  recentlyViewed?: Types.ObjectId[]
  loyaltyPoints?: {
    total?: number
    available?: number
    used?: number
  }
  membershipTier?: 'bronze' | 'silver' | 'gold' | 'platinum'
  preferences?: {
    notifications?: {
      email?: boolean | object
      sms?: boolean
      push?: boolean | object
    }
    newsletter?: boolean
    language?: string
    currency?: string
  }
  verification?: {
    email?: {
      isVerified: boolean
      token?: string
      expiresAt?: Date
    }
    phone?: {
      isVerified: boolean
      token?: string
      expiresAt?: Date
    }
  }
  twoFactorAuth?: {
    enabled: boolean
    secret?: string
    backupCodes?: string[]
  }
  passwordResetToken?: string
  passwordResetExpires?: Date
  lastLogin?: Date
  loginAttempts?: number
  lockUntil?: Date
  createdAt?: Date
  updatedAt?: Date
  comparePassword(candidatePassword: string): Promise<boolean>
  verifyPassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['client', 'partner', 'admin'],
      default: 'client',
    },
    adminLevel: {
      type: String,
      enum: ['super_admin', 'admin', 'support_admin'],
      required: function() {
        return this.role === 'admin'
      },
    },
    shopName: {
      type: String,
      trim: true,
    },
    shopDescription: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    address: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    businessType: {
      type: String,
      enum: ['individual', 'company', 'enterprise'],
      default: 'individual',
    },
    taxCode: {
      type: String,
      trim: true,
    },
    bankAccount: {
      type: String,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    notificationSettings: {
      emailNotifications: { type: Boolean, default: true },
      orderNotifications: { type: Boolean, default: true },
      promotionNotifications: { type: Boolean, default: false },
      systemNotifications: { type: Boolean, default: true },
    },
    storeSettings: {
      autoApproveOrders: { type: Boolean, default: false },
      minOrderAmount: { type: Number, default: 0 },
      freeShippingThreshold: { type: Number, default: 0 },
      workingHours: {
        start: { type: String, default: '08:00' },
        end: { type: String, default: '22:00' },
      },
      workingDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
    },
    addresses: [
      {
        label: {
          type: String,
          enum: ['home', 'office', 'other'],
          default: 'home',
        },
        fullName: String,
        phone: String,
        address: {
          street: String,
          ward: String,
          district: String,
          city: String,
          zipCode: String,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    paymentMethods: [
      {
        type: {
          type: String,
          enum: ['card', 'bank', 'ewallet'],
          required: true,
        },
        provider: String,
        lastFourDigits: String,
        accountName: String,
        expiryDate: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    orderHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    recentlyViewed: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    loyaltyPoints: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
      used: { type: Number, default: 0 },
    },
    membershipTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    preferences: {
      // Notification settings
      notifications: {
        email: {
          orderUpdates: { type: Boolean, default: true },
          priceAlerts: { type: Boolean, default: true },
          promotions: { type: Boolean, default: true },
          warrantyReminders: { type: Boolean, default: true },
        },
        push: {
          orderUpdates: { type: Boolean, default: true },
          priceAlerts: { type: Boolean, default: false },
          promotions: { type: Boolean, default: false },
        },
      },
      // Display preferences
      language: {
        type: String,
        enum: ['vi', 'en'],
        default: 'vi',
      },
      currency: {
        type: String,
        enum: ['VND', 'USD'],
        default: 'VND',
      },
    },
    verification: {
      email: {
        isVerified: { type: Boolean, default: false },
        token: String,
        expiresAt: Date,
      },
      phone: {
        isVerified: { type: Boolean, default: false },
        token: String,
        expiresAt: Date,
      },
    },
    twoFactorAuth: {
      enabled: { type: Boolean, default: false },
      secret: String,
      backupCodes: [String],
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Alias for verifyPassword
UserSchema.methods.verifyPassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > new Date())
})

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema)
