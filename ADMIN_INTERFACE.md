# Admin Web Interface - Multi-User Media Library

## Overview

The Admin Interface is a web-based control panel that allows multiple users to collaboratively manage and share media content for the LiveChat CaCaBox stream overlay. This feature eliminates the need for Discord commands and enables seamless sharing of local media files between team members.

## Features

### 🌐 Multi-User Collaboration
- Multiple users can connect simultaneously from different computers
- Real-time synchronization of media libraries
- See which users are online
- Each user maintains their own local media folder

### 📚 Shared Media Library
- Users can add local folders containing images and videos
- Automatically generates thumbnails for all media
- Shared view of all available media across all users
- Filter by media type (all, images, videos)
- Display media information (filename, type, duration, owner)

### 🔄 P2P Streaming Architecture
- **No file duplication**: Media files stay on the owner's computer
- **On-demand streaming**: Files are streamed only when played
- **Efficient bandwidth**: Only thumbnails (~50KB) are shared initially
- **Secure**: Temporary streaming endpoints with path validation

### 📤 Full Control Panel
Four main tabs provide complete control:

1. **Media Library**: Browse and play shared media
2. **Send Message**: Send text messages with optional media URLs
3. **Text-to-Speech**: Generate and play synthesized speech
4. **Users**: View all connected users and their media counts

## Getting Started

### 1. Start the Server

```bash
pnpm dev
```

The server will start on http://localhost:3000

### 2. Access the Admin Interface

Open your browser and navigate to:
```
http://localhost:3000/admin
```

### 3. Connect with a Username

Enter a username and click "Connect". You'll be registered in the system and can start using the interface.

### 4. Add Your Media Folder

In the "Media Library" tab:
1. Enter the full path to your media folder (e.g., `C:\Users\YourName\Videos`)
2. Click "Scan Folder"
3. Wait for the scan to complete
4. Your media will appear in the grid

**Supported formats:**
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`
- **Videos**: `.mp4`, `.webm`, `.mov`, `.avi`, `.mkv`

## Usage Examples

### Scenario 1: Single User
1. User Alice connects to `/admin`
2. Alice adds her folder `C:\Users\Alice\Images`
3. The system scans and finds 10 images
4. Alice can now play any of her images on the stream

### Scenario 2: Multi-User Collaboration
1. User Alice connects and adds her folder (10 images)
2. User Bob connects from another computer and adds his folder (5 videos)
3. Both users now see 15 media items in total
4. Alice can play Bob's videos without downloading them
5. When Alice plays Bob's video:
   - System requests stream from Bob's computer
   - Bob's client creates a temporary streaming endpoint
   - Video is streamed directly from Bob's PC to the LiveChat

### Scenario 3: Team Stream Setup
1. Streamer (host) sets up OBS with LiveChat overlay
2. Team members connect to `/admin` from their computers
3. Each member adds their media folders:
   - Photographer adds product images
   - Video editor adds b-roll footage
   - Designer adds graphics
4. Everyone can trigger any media to appear on stream
5. Stop button allows immediate cancellation of current media

## Technical Architecture

### Backend Components

#### 1. Database Models (Prisma)
- **User**: Stores registered admin users
- **MediaFolder**: Tracks folders shared by each user
- **MediaItem**: Individual media files with metadata

#### 2. API Routes (`/admin/api/*`)
- `GET /admin` - Serves the admin interface HTML
- `GET /api/admin/media` - Lists all shared media with metadata
- `GET /api/admin/media/:id/stream` - Streams a specific media file

#### 3. Socket.IO Events

**Client → Server:**
- `admin:register` - Register a new user
- `admin:scan-folder` - Scan and add a folder
- `admin:play-media` - Play a media item
- `admin:stream-response` - Provide stream URL (owner response)
- `admin:send-message` - Send text/media message
- `admin:speak` - Generate text-to-speech
- `admin:stop` - Stop current media

**Server → Client:**
- `admin:registered` - Confirm user registration
- `admin:user-online` - Notify user connected
- `admin:user-offline` - Notify user disconnected
- `admin:media-added` - Broadcast new media
- `admin:stream-request` - Request stream from owner
- `admin:scan-complete` - Folder scan finished
- `admin:play-success` - Media queued successfully
- `admin:error` - Error occurred

### Frontend (Vue.js 3 SPA)

#### Technology Stack
- **Vue.js 3**: Reactive UI framework
- **Tailwind CSS**: Modern styling
- **Socket.IO Client**: Real-time communication
- **Fetch API**: REST API calls

#### Key Features
- Single-page application (no page reloads)
- Real-time updates across all connected clients
- Responsive design
- Card-based media grid with hover effects
- Tab-based navigation
- Floating stop button for quick access

### Security Features

1. **Path Validation**: `isPathSafe()` prevents directory traversal attacks
2. **Filename Sanitization**: Prevents malicious filenames
3. **Temporary Endpoints**: Stream URLs expire after use
4. **Permission Checks**: Users can only stream their own media
5. **Input Validation**: All user inputs are validated

## Media Processing

### Thumbnail Generation

**For Images:**
- Uses the `sharp` library
- Resizes to 200x200 pixels
- Converts to JPEG with 80% quality
- Encodes as base64 data URI
- Stored in database (no separate files)

**For Videos:**
- Currently uses SVG placeholder
- Future enhancement: Extract frame with ffmpeg
- Placeholder includes video icon and blue background

### File Scanning Process

1. Read directory contents
2. Filter by supported extensions
3. For each file:
   - Get file size and stats
   - Generate thumbnail
   - Extract duration (videos only)
   - Store metadata
4. Batch insert into database
5. Broadcast to all connected users

## Configuration

### Environment Variables

The admin interface uses existing environment variables:

```env
API_URL=http://localhost:3000
DATABASE_URL="file:./sqlite.db"
```

### Guild Configuration

The interface respects guild settings:
- `defaultMediaTime`: Default display duration
- `maxMediaTime`: Maximum allowed duration
- `displayMediaFull`: Full-screen display mode

Set guild ID in the interface (default: "default")

## Troubleshooting

### Media not appearing after scan
- Check folder path is absolute and correct
- Verify file extensions are supported
- Check server logs for errors
- Ensure folder is readable

### Unable to play media from another user
- Verify the media owner is online (green dot)
- Check network connectivity
- Look for errors in browser console
- Ensure firewall allows local connections

### Thumbnails showing placeholder
- For images: Check `sharp` is installed (`pnpm add sharp`)
- For videos: This is expected (MVP uses placeholders)
- Check file permissions

### Connection issues
- Verify server is running on port 3000
- Check browser console for Socket.IO errors
- Ensure no firewall blocking WebSocket connections
- Try refreshing the page

## Future Enhancements

### Planned Features
1. **Video Thumbnails**: Extract actual frames using ffmpeg
2. **Media Upload**: Upload files through web interface
3. **Playlists**: Create and manage media playlists
4. **Effects**: Add transitions and effects to media
5. **Permissions**: Role-based access control
6. **History**: Track played media
7. **Search**: Search and filter by tags/keywords
8. **Mobile**: Responsive mobile interface
9. **Drag & Drop**: Reorder queue items
10. **Preview**: Preview media before playing

### Performance Optimizations
- Lazy loading for large media libraries
- Virtual scrolling for thousands of items
- Thumbnail caching improvements
- WebRTC for direct P2P streaming

## Development

### Adding New Features

1. **Backend**: Extend `socketLoader.ts` with new events
2. **API**: Add routes to `adminRoutes.ts`
3. **Frontend**: Update `admin.html` Vue.js methods
4. **Database**: Update Prisma schema if needed

### Testing

```bash
# Run linter
pnpm lint

# Check TypeScript
npx tsc --noEmit

# Generate Prisma client
pnpm generate

# Create migration
pnpm migration:make --name your_migration_name

# Apply migrations
pnpm migration:up
```

### Code Structure

```
src/
├── components/
│   └── admin/
│       ├── adminRoutes.ts     # HTTP API routes
│       └── admin.html         # Vue.js SPA frontend
├── loaders/
│   ├── RESTLoader.ts          # Routes registration
│   └── socketLoader.ts        # Socket.IO events
├── services/
│   └── media-scanner.ts       # Media scanning & thumbnails
└── prisma/
    └── schema.prisma          # Database models
```

## License

This feature is part of LiveChat CaCaBox and follows the same license as the main project.

## Support

For issues or questions:
1. Check server logs for errors
2. Review browser console for client-side errors
3. Verify network connectivity
4. Consult this documentation
5. Open an issue on GitHub

---

**Note**: This feature requires Node.js 20+ and modern browsers with WebSocket support.
