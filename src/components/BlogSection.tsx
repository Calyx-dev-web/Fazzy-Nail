import React, { useState } from 'react';
import { BlogPost, getWhatsAppUrl } from '../types';
import { INITIAL_BLOG_POSTS } from '../data/initialData';
import { Clock, ArrowRight, X, Sparkles, MessageSquare } from 'lucide-react';

export const BlogSection: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <section id="blog" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
          <span className="text-xs uppercase font-semibold tracking-widest text-rose-700">
            Nail Care Knowledge
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-stone-900">
            The Classy Nail Journal
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Professional aftercare routines, nail anatomy insights, and the latest luxury salon trends.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {INITIAL_BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div
                  className="aspect-[16/10] overflow-hidden cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="font-semibold text-rose-700">{post.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedPost(post)}
                    className="font-editorial text-xl font-bold text-stone-900 group-hover:text-rose-900 transition-colors cursor-pointer leading-snug"
                  >
                    {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedPost(post)}
                  className="text-xs font-semibold text-stone-900 hover:text-rose-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <span className="text-[11px] text-stone-400 font-mono">{post.date}</span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Article Reader Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-stone-200 my-8">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-800 rounded-full cursor-pointer"
              aria-label="Close article modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="font-semibold text-rose-700">{selectedPost.category}</span>
                  <span>·</span>
                  <span>{selectedPost.date}</span>
                  <span>·</span>
                  <span>{selectedPost.readTime}</span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
                  {selectedPost.title}
                </h3>
              </div>

              <div className="aspect-[16/9] rounded-2xl overflow-hidden">
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4 text-stone-700 text-sm sm:text-base leading-relaxed">
                {selectedPost.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-stone-600">
                  Have questions about your nails? Ask our head nail technician directly.
                </div>
                <a
                  href={getWhatsAppUrl(`Hello Fazzynails, I read your article "${selectedPost.title}" and had a quick question.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
