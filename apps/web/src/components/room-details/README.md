# Room Details Component Structure

This directory contains all components related to the Room Details page, organized in a modular and maintainable structure.

## 📁 Folder Structure

```
components/room-details/
├── index.ts                      # Main export file
├── types.ts                      # TypeScript interfaces
├── mockData.tsx                  # Mock data for development
├── AnimatedBackground.tsx        # Animated background component
├── RoomHeader.tsx               # Room header with navigation
├── StatsBar.tsx                 # Statistics bar
├── TabNavigation.tsx            # Tab navigation component
├── MessageInput.tsx             # Message input with attachments
├── MembersSidebar.tsx           # Members sidebar
├── tabs/
│   ├── ChatsTab.tsx            # Chats tab content
│   ├── PostsTab.tsx            # Posts tab content
│   └── ResourcesTab.tsx        # Resources tab content
└── modals/
    ├── CreatePostModal.tsx     # Create post modal
    └── CreateResourceModal.tsx # Create resource modal
```

## 🧩 Components

### Core Components

- **AnimatedBackground**: Pulsing gradient orbs background
- **RoomHeader**: Top navigation bar with room info and action buttons
- **StatsBar**: Displays room statistics (messages, posts, resources, activity)
- **TabNavigation**: Tab switcher for chats, posts, and resources
- **MessageInput**: Chat message input with emoji and attachment buttons
- **MembersSidebar**: Shows online/offline members with role badges

### Tab Components

- **ChatsTab**: Displays chat messages
- **PostsTab**: Shows posts with comments and create post button
- **ResourcesTab**: Lists shared resources with create resource button

### Modal Components

- **CreatePostModal**: Modal for creating new posts
- **CreateResourceModal**: Modal for sharing new resources

## 📝 Types

All TypeScript interfaces are defined in `types.ts`:

- `Member`: User member data
- `Chat`: Chat message data
- `Post`: Post with comments
- `Comment`: Comment on a post
- `Resource`: Shared resource
- `TabType`: Tab selection type

## 🎨 Usage

Import components from the main index file:

```tsx
import {
    AnimatedBackground,
    RoomHeader,
    StatsBar,
    // ... other components
} from '../components/room-details';
```

## 🔄 State Management

The main `RoomDetails` page manages:

- Active tab selection
- Message input state
- Members sidebar visibility
- Modal visibility and content
- Post and resource creation

## 🎯 Benefits of This Structure

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused
3. **Maintainability**: Easy to find and update specific features
4. **Testability**: Individual components can be tested in isolation
5. **Scalability**: Easy to add new features or components
6. **Type Safety**: Full TypeScript support with shared types
7. **Clean Imports**: Single import point through index.ts

## 🚀 Future Enhancements

- Connect to real API endpoints
- Add real-time updates via WebSocket
- Implement pagination for posts and resources
- Add file upload functionality
- Implement search and filtering
- Add member management features
