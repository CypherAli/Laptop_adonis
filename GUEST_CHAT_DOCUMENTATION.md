# Guest Chat với Partner - Real-time Messaging

## Tổng Quan

Hệ thống chat real-time cho phép **Guest (khách vãng lai chưa đăng nhập)** có thể nhắn tin trực tiếp với **Partner** đang hoạt động.

### Tính Năng Chính

✅ **Guest Chat**
- Khách không cần đăng nhập
- Tự động tạo Anonymous ID (lưu trong localStorage)
- Chọn partner để chat
- Nhập tên hiển thị (lưu persistent)

✅ **Real-time Messaging**
- Socket.IO cho real-time communication
- Cả 2 bên nhận tin nhắn ngay lập tức
- Không bị duplicate messages
- Typing indicators

✅ **Partner Side**
- Nhận tin nhắn từ cả user và guest
- Hiển thị danh sách customers (bao gồm guest với icon 👻)
- Real-time updates

## Cấu Trúc Code

### Backend (AdonisJS)

#### 1. Socket Provider (`providers/socket_provider.ts`)
```typescript
- guest:join - Guest kết nối
- user:join - User đăng nhập kết nối
- partner:join - Partner kết nối
- message:send - Gửi tin nhắn
- conversation:join/leave - Tham gia/rời phòng chat
- typing:start/stop - Typing indicators
```

#### 2. Chat Controller (`app/controllers/chat_controller.ts`)
**Endpoints:**
- `GET /api/chat/partners` - Lấy danh sách partners hoạt động (public)
- `POST /api/chat/conversations` - Tạo/lấy conversation (guest + user)
- `GET /api/chat/messages/:conversationId` - Lấy tin nhắn
- `GET /api/chat/partner/:partnerId/customers` - Lấy danh sách customers cho partner

#### 3. Models

**Message Model:**
```typescript
{
  conversation: ObjectId,
  sender: ObjectId (optional - null for guest),
  senderType: 'user' | 'anonymous',
  anonymousSender: {
    id: String,
    name: String
  },
  content: String,
  isRead: Boolean
}
```

**Conversation Model:**
```typescript
{
  participants: [ObjectId],
  anonymousUser: {
    id: String,
    name: String
  },
  subject: String,
  lastMessage: {
    content: String,
    timestamp: Date,
    sender: String
  }
}
```

### Frontend (React)

#### 1. GuestChatWidget Component (`client/src/components/chat/GuestChatWidget.js`)

**Features:**
- Name prompt cho guest lần đầu
- Chọn partner từ danh sách
- Real-time chat interface
- Optimistic UI updates
- Duplicate prevention

**State Management:**
```javascript
- socket: Socket.IO connection
- messages: Array of messages
- selectedPartner: Current partner
- activeConversation: Current conversation
- guestName: Guest's display name (from localStorage)
```

**Socket Events:**
```javascript
// Emit
socket.emit('guest:join', anonymousId)
socket.emit('message:send', {...})
socket.emit('typing:start', {...})

// Listen
socket.on('message:received', (data) => {...})
socket.on('typing:active', ({username}) => {...})
```

#### 2. PartnerLiveChat Updates (`client/src/components/chat/PartnerLiveChat.js`)

**Changes:**
- Nhận messages từ cả user và guest
- Hiển thị guest với icon 👻
- Support `senderType` field
- Handle `anonymousSender` object

## Flow Hoạt Động

### Guest Chat Flow

1. **Guest mở website** → Không đăng nhập
2. **Click chat button** → GuestChatWidget mở
3. **Nhập tên** (nếu lần đầu) → Lưu vào localStorage
4. **Chọn partner** từ danh sách → Tạo conversation
5. **Gửi tin nhắn** → Socket.IO emit `message:send`
6. **Backend lưu DB** → Emit `message:received` vào conversation room
7. **Cả guest và partner nhận** tin nhắn real-time

### Partner Nhận Tin

1. **Partner đăng nhập** → Socket connect với `partner:join`
2. **Nhận event** `message:received` từ socket
3. **Kiểm tra duplicate** → Thay temp message bằng real message
4. **Hiển thị tin nhắn** với tên sender (user/guest)
5. **Trả lời tin nhắn** → Emit `message:send`

## Cách Chạy

### 1. Backend (AdonisJS)

```bash
cd e:\Adonis

# Install dependencies (socket.io đã được cài)
npm install

# Start server
npm run dev
```

Server chạy tại: `http://localhost:3333`

Socket.IO khởi động cùng server:
```
✅ MongoDB connected successfully to cluster0
🔌 Booting Socket.IO provider...
✅ Socket.IO server initialized
[ info ] starting HTTP server on http://localhost:3333
```

### 2. Frontend (React)

```bash
cd e:\Adonis\client

# Install dependencies
npm install

# Start dev server
npm start
```

Frontend chạy tại: `http://localhost:3000`

### 3. Cấu Hình Environment

**Backend (.env):**
```env
PORT=3333
HOST=localhost
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://...
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:3333
```

## Testing

### Test Guest Chat

1. Mở browser **incognito/private mode**
2. Vào `http://localhost:3000`
3. Click vào chat button (góc phải màn hình)
4. Nhập tên → Chọn partner
5. Gửi tin nhắn

### Test Partner Side

1. Login với tài khoản partner
2. Dashboard → Chat widget xuất hiện
3. Nhận tin nhắn từ guest real-time
4. Trả lời tin nhắn

### Verify No Duplicates

✅ **Optimistic UI:**
- Tin nhắn hiển thị ngay khi gửi (temp)
- Khi nhận từ server → replace temp bằng real message

✅ **Duplicate Check:**
```javascript
const exists = prev.some(m => 
    m._id === message._id ||
    (m.temp && m.content === message.content && 
     Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 1000)
);
```

## Troubleshooting

### Socket không connect

```bash
# Check backend log
🔌 New socket connection: abc123
👻 Guest joined: guest_xyz (abc123)
```

Nếu không thấy → Check CORS config trong `socket_provider.ts`

### Messages bị duplicate

- Check duplicate prevention logic
- Verify temp message replacement
- Console log để debug

### Guest không thấy partners

- Check `/api/chat/partners` endpoint
- Verify có partner nào `isActive: true`
- Check network tab trong DevTools

## Advanced Features

### Typing Indicators

Guest/Partner gõ → Bên kia thấy "đang nhập..."

```javascript
socket.emit('typing:start', {
  conversationId,
  anonymousName: 'Guest Name'
})

// Auto stop after 3s
setTimeout(() => {
  socket.emit('typing:stop', { conversationId })
}, 3000)
```

### Message History

Load lại tin nhắn khi refresh:
```javascript
const response = await fetch(
  `${apiUrl}/chat/messages/${conversationId}`
)
```

### Anonymous ID Persistence

```javascript
localStorage.setItem('anonymousId', 'guest_abc123')
localStorage.setItem('guestName', 'John Doe')
```

Guest quay lại website → Same ID → Same conversation history

## API Reference

### Socket Events

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `guest:join` | Client→Server | `anonymousId` | Guest kết nối |
| `partner:join` | Client→Server | `partnerId` | Partner kết nối |
| `message:send` | Client→Server | `{conversationId, content, senderType, ...}` | Gửi tin nhắn |
| `message:received` | Server→Client | `{message, conversationId}` | Nhận tin nhắn |
| `typing:start` | Client→Server | `{conversationId, anonymousName}` | Bắt đầu gõ |
| `typing:active` | Server→Client | `{username}` | Ai đó đang gõ |

### HTTP Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/chat/partners` | Public | Danh sách partners |
| POST | `/api/chat/conversations` | Guest/User | Tạo conversation |
| GET | `/api/chat/messages/:id` | Guest/User | Lấy tin nhắn |
| GET | `/api/chat/partner/:id/customers` | Partner | Danh sách customers |

## Security Notes

- ✅ Guest chỉ thấy partner list (không thấy user data)
- ✅ Anonymous ID random, không dự đoán được
- ✅ Conversation chỉ giữa 2 participants
- ✅ Socket rooms cô lập từng conversation
- ⚠️ Consider rate limiting cho guest messages
- ⚠️ Consider moderation cho nội dung tin nhắn

## Future Enhancements

1. **File Upload** - Guest gửi ảnh sản phẩm
2. **Auto-Response** - Bot reply khi partner offline
3. **Chat History** - Guest download conversation
4. **Multiple Guests** - 1 conversation nhiều guests (group chat)
5. **Message Read Receipts** - Seen/Delivered status
6. **Push Notifications** - Browser notifications cho guest

---

**Built with:**
- AdonisJS 6 + Socket.IO
- React + socket.io-client
- MongoDB + Mongoose
- Framer Motion (animations)
