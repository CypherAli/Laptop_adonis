import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  anonymousUser: {
    id: String,
    name: String
  },
  subject: {
    type: String,
    default: 'Product Consultation'
  },
  lastMessage: {
    content: String,
    timestamp: Date,
    sender: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export const Conversation = mongoose.model('Conversation', conversationSchema)
