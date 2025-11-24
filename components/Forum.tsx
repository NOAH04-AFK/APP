import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, Star, User as UserIcon, PlusCircle, AlertCircle } from 'lucide-react';
import { ForumPost, User, Build, PCComponent } from '../types';
import { generateForumFeedback } from '../services/geminiService';

interface ForumProps {
  user: User | null;
  currentBuild: Build; // Pass current build to allow sharing
}

// Mock Data
const MOCK_POSTS: ForumPost[] = [
  {
    id: '1',
    author: 'TechMaster99',
    title: 'Mi Bestia para 4K Gaming',
    description: 'Logré conseguir una 4090 a buen precio. ¿Qué opinan del flujo de aire?',
    build: {
      id: 'b1',
      name: '4K Beast',
      totalPrice: 3200,
      components: [
        { id: 'c1', name: 'Intel i9 13900K', type: 'Procesador' as any, price: 580, specs: '24 Cores' },
        { id: 'c2', name: 'RTX 4090', type: 'Tarjeta Gráfica' as any, price: 1600, specs: '24GB VRAM' }
      ]
    },
    likes: 124,
    comments: 45,
    createdAt: 'Hace 2 horas',
    aiRating: 9.5
  },
  {
    id: '2',
    author: 'BudgetKing',
    title: 'PC Económica para eSports',
    description: 'Optimizada para Valorant y CS2 por menos de $600.',
    build: {
      id: 'b2',
      name: 'Budget Gamer',
      totalPrice: 590,
      components: [
        { id: 'c3', name: 'Ryzen 5 5600', type: 'Procesador' as any, price: 130, specs: '6 Cores' },
        { id: 'c4', name: 'RX 6600', type: 'Tarjeta Gráfica' as any, price: 200, specs: '8GB VRAM' }
      ]
    },
    likes: 89,
    comments: 12,
    createdAt: 'Hace 5 horas',
    aiRating: 8.8
  }
];

export const Forum: React.FC<ForumProps> = ({ user, currentBuild }) => {
  const [posts, setPosts] = useState<ForumPost[]>(MOCK_POSTS);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostDesc, setNewPostDesc] = useState('');
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const handleShareBuild = async () => {
    if (!user || user.isGuest) {
      alert("Debes registrarte para compartir tu build.");
      return;
    }
    if (currentBuild.components.length === 0) {
      alert("Tu build está vacía. Agrega componentes primero.");
      return;
    }

    // Simulate AI analyzing the build before posting
    const feedback = await generateForumFeedback(currentBuild.components.map(c => c.name).join(', '));
    setAiFeedback(feedback);
    setShowNewPostModal(true);
  };

  const publishPost = () => {
    if (!user) return;
    
    const newPost: ForumPost = {
      id: Date.now().toString(),
      author: user.username,
      title: currentBuild.name || 'Mi Nueva Build',
      description: newPostDesc,
      build: currentBuild,
      likes: 0,
      comments: 0,
      createdAt: 'Justo ahora',
      aiRating: 0 // In real app, Gemini would calculate this
    };

    setPosts([newPost, ...posts]);
    setShowNewPostModal(false);
    setNewPostDesc('');
    setAiFeedback(null);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Comunidad PC Builder</h2>
        <button 
          onClick={handleShareBuild}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition"
        >
          <PlusCircle size={18} />
          Compartir Build Actual
        </button>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="p-4 flex items-center gap-3 border-b border-gray-100">
              <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                {post.author[0]}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{post.title}</h3>
                <p className="text-xs text-gray-500">por @{post.author} • {post.createdAt}</p>
              </div>
              {post.aiRating && (
                <div className="ml-auto bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                  <Star size={12} fill="currentColor" />
                  AI Score: {post.aiRating}/10
                </div>
              )}
            </div>
            
            <div className="p-4">
              <p className="text-gray-700 mb-4">{post.description}</p>
              
              {/* Mini Build Preview */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-200">
                <h4 className="font-semibold text-gray-600 mb-2">Especificaciones Clave:</h4>
                <ul className="space-y-1">
                  {post.build.components.slice(0, 3).map(c => (
                    <li key={c.id} className="flex justify-between text-gray-700">
                      <span>{c.type}:</span>
                      <span className="font-medium">{c.name}</span>
                    </li>
                  ))}
                  {post.build.components.length > 3 && (
                    <li className="text-indigo-600 text-xs text-center pt-1">
                      + {post.build.components.length - 3} componentes más
                    </li>
                  )}
                </ul>
                <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center">
                   <span className="text-xs text-gray-500">Total Estimado</span>
                   <span className="font-bold text-indigo-700">${post.build.totalPrice}</span>
                </div>
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center text-gray-500 text-sm">
              <button className="flex items-center gap-1 hover:text-red-500 transition">
                <Heart size={18} /> {post.likes}
              </button>
              <button className="flex items-center gap-1 hover:text-indigo-500 transition">
                <MessageSquare size={18} /> {post.comments}
              </button>
              <button className="flex items-center gap-1 hover:text-gray-800 transition">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-4">Compartir configuración</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea 
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={3}
                placeholder="Cuéntanos sobre tu build..."
                value={newPostDesc}
                onChange={(e) => setNewPostDesc(e.target.value)}
              />
            </div>

            {aiFeedback && (
                <div className="mb-4 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-800 border border-indigo-100 flex gap-2">
                    <AlertCircle size={20} className="shrink-0" />
                    <p><strong>Gemini dice:</strong> "{aiFeedback}"</p>
                </div>
            )}

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowNewPostModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={publishPost}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
