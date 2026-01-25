import mongoose from 'mongoose'

const SettingsSchema = new mongoose.Schema(
  {
    // Site Information
    siteName: {
      type: String,
      default: 'Shoe Shop',
    },
    siteDescription: {
      type: String,
      default: 'Your trusted online shoe marketplace',
    },
    siteLogo: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      default: 'contact@shoeshop.com',
    },
    contactPhone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },

    // Maintenance Mode
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: 'Website đang bảo trì, vui lòng quay lại sau!',
    },

    // Email Settings
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    orderConfirmationEmail: {
      type: Boolean,
      default: true,
    },
    emailFromName: {
      type: String,
      default: 'Shoe Shop',
    },
    emailFromAddress: {
      type: String,
      default: 'noreply@shoeshop.com',
    },

    // Order Settings
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxOrderAmount: {
      type: Number,
      default: 100000000, // 100 triệu
    },
    freeShippingThreshold: {
      type: Number,
      default: 500000, // 500k
    },
    defaultShippingFee: {
      type: Number,
      default: 30000, // 30k
    },

    // Payment Settings
    paymentMethods: {
      type: [String],
      default: ['cod', 'bank_transfer', 'momo', 'vnpay'],
    },
    codEnabled: {
      type: Boolean,
      default: true,
    },
    bankTransferEnabled: {
      type: Boolean,
      default: true,
    },

    // Product Settings
    defaultProductsPerPage: {
      type: Number,
      default: 12,
    },
    maxProductImages: {
      type: Number,
      default: 10,
    },
    allowGuestReviews: {
      type: Boolean,
      default: false,
    },
    requireReviewApproval: {
      type: Boolean,
      default: true,
    },

    // Social Links
    facebookUrl: {
      type: String,
      default: '',
    },
    instagramUrl: {
      type: String,
      default: '',
    },
    twitterUrl: {
      type: String,
      default: '',
    },
    youtubeUrl: {
      type: String,
      default: '',
    },

    // SEO Settings
    metaTitle: {
      type: String,
      default: 'Shoe Shop - Giày chính hãng',
    },
    metaDescription: {
      type: String,
      default: 'Mua sắm giày chính hãng với giá tốt nhất',
    },
    metaKeywords: {
      type: String,
      default: 'giày, shoe, sneaker, giày thể thao',
    },

    // Analytics
    googleAnalyticsId: {
      type: String,
      default: '',
    },
    facebookPixelId: {
      type: String,
      default: '',
    },

    // Last updated info
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

export const Settings = mongoose.model('Settings', SettingsSchema)
