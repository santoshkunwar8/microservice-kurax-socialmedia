import { useState } from 'react';
import { Plus, Globe, Lock, X } from 'lucide-react';

// Hardcoded list of available topics
const AVAILABLE_TOPICS = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'DevOps',
  'Cloud Computing',
  'Cybersecurity',
  'Blockchain',
  'Game Development',
  'UI/UX Design',
  'Frontend',
  'Backend',
  'Full Stack',
  'JavaScript',
  'Python',
  'React',
  'Node.js',
  'AI',
  'Startups',
  'Career',
  'Open Source',
  'Music',
  'Gaming',
  'Art & Design',
  'Photography',
  'Writing',
  'Fitness',
  'Travel',
  'Food',
  'Books',
  'Movies',
  'Tech News',
  'Productivity',
  'Networking',
  'Mentorship',
];

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, type: 'GROUP' | 'PRIVATE', topics: string[]) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateRoomModal({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState<'public' | 'private'>('public');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicSearch, setTopicSearch] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!roomName.trim()) return;
    await onCreate(roomName, roomType === 'public' ? 'GROUP' : 'PRIVATE', selectedTopics);
    setRoomName('');
    setRoomType('public');
    setSelectedTopics([]);
    setTopicSearch('');
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const filteredTopics = AVAILABLE_TOPICS.filter(topic =>
    topic.toLowerCase().includes(topicSearch.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition"
        >
          <Plus className="w-5 h-5 rotate-45" />
        </button>

        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Create New Room
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500/50 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Privacy
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRoomType('public')}
                className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                  roomType === 'public'
                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Globe className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-semibold">Public</div>
              </button>
              <button
                type="button"
                onClick={() => setRoomType('private')}
                className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                  roomType === 'private'
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Lock className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-semibold">Private</div>
              </button>
            </div>
          </div>

          {/* Topics Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-300">
              Topics (optional)
            </label>
            
            {/* Selected Topics */}
            {selectedTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedTopics.map(topic => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-full text-sm"
                  >
                    {topic}
                    <button
                      onClick={() => toggleTopic(topic)}
                      className="hover:text-white transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search Topics */}
            <input
              type="text"
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              placeholder="Search topics..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 mb-3 focus:outline-none focus:border-purple-500/50 transition text-sm"
            />

            {/* Topics Grid */}
            <div className="max-h-40 overflow-y-auto rounded-xl border border-white/10 p-3 bg-white/5">
              <div className="flex flex-wrap gap-2">
                {filteredTopics.map(topic => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedTopics.includes(topic)
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !roomName.trim()}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl font-semibold transition-all transform hover:scale-105 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </span>
            ) : (
              'Create Room'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
