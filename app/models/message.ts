import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  senderType: {
    type: String,
    enum: ['user', 'anonymous'],
    default: 'user'
  },
  anonymousSender: {
    id: String,
    name: String
  },
  content: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

export const Message = mongoose.model('Message', messageSchema)
