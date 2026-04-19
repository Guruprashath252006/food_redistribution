import { useState } from 'react';
import { useAppData } from '../context/appDataContext';
import BorderGlow from '../components/ui/BorderGlow';
import { useOverlay } from '../components/ui/overlayContext';
import { Users, Megaphone, Heart, MessageCircle, Trophy, Loader2, Star, Award } from 'lucide-react';

const Community = () => {
    const { user, communityPosts, leaderboard, createPost, likePost, replyToPost } = useAppData();
    const { prompt, toast } = useOverlay();
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const handleCreatePost = (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;
        createPost(newPostContent);
        setNewPostContent('');
        setIsPosting(false);
    };

    return (
      <div className="flex flex-col h-full animate-fade-in-up transition-colors duration-300 p-6 md:p-10">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex bg-pink-50 dark:bg-pink-900/20 px-3 py-1 rounded-full mb-3 border border-pink-100 dark:border-pink-800/50 shadow-sm transition-all">
             <span className="text-[14px] font-black text-pink-600 dark:text-pink-400 tracking-[0.2em] uppercase flex items-center"><Users size={16} className="mr-2" /> The Network</span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
             <div className="w-full md:w-auto">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">Community Hub</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm sm:text-lg font-bold tracking-tight max-w-2xl">Connect, compete, and collaborate with the heroes of the redistribution network.</p>
             </div>
              <button 
                onClick={() => setIsPosting(!isPosting)}
                className="primary-button flex items-center text-[16px] px-8 py-4 transition-all"
              >
                 <Megaphone size={18} className="mr-3" /> {isPosting ? 'Cancel' : 'Create Post'}
              </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8 flex-1">
            
            {/* Left Col - Activity Feed */}
            <div className="flex-1 space-y-6">
                 <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
                       Live Feed
                    </h2>
                    <span className="bg-white dark:bg-slate-900 px-3 py-1 rounded-full text-[14px] font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 flex items-center border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div> LIVE DATA
                    </span>
                </div>

                {isPosting && (
                    <BorderGlow borderRadius={40} backgroundColor="#060010" className="animate-fade-in-up">
                        <form onSubmit={handleCreatePost} className="p-8">
                            <textarea 
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="Share an update with the network..."
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-lg font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner min-h-[120px]"
                            />
                            <div className="flex justify-end mt-4">
                                <button type="submit" className="primary-button px-8 py-3 text-sm">Post to Feed</button>
                            </div>
                        </form>
                    </BorderGlow>
                )}

                {communityPosts.map((post, idx) => (
                    <BorderGlow 
                      key={idx} 
                      borderRadius={32}
                      backgroundColor="#060010"
                      className={`hover:-translate-y-1 transition-all group animate-fade-in-up delay-${(idx+1)*100} shadow-xl shadow-slate-900/5 dark:shadow-none overflow-visible`}
                    >
                      <div className="p-6 md:p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner ${post.theme} border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700/50 transition-all shrink-0`}>
                                    {post.icon}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white leading-none text-base sm:text-lg tracking-tight capitalize mb-1">{post.user}</h3>
                                     <p className="text-[11px] sm:text-[13px] font-black text-slate-500 tracking-[0.2em] uppercase">{post.time}</p>
                                </div>
                            </div>
                            <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2">•••</button>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-bold text-sm sm:text-lg leading-relaxed mb-6 sm:mb-8">
                            {post.content}
                        </p>
                         <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
                             <button 
                                onClick={() => likePost(post.id)}
                                className="flex items-center text-slate-500 font-black text-[14px] tracking-[0.2em] uppercase hover:text-pink-500 transition-colors px-4 py-2 rounded-xl -ml-2"
                             >
                                <Heart size={20} className="mr-2 group-hover:scale-110 transition-transform" /> {post.likes} LIKES
                            </button>
                             <button 
                                onClick={() => {
                                    (async () => {
                                      const reply = await prompt({
                                        title: 'Reply to post',
                                        description: `Replying as ${user?.name || 'Partner'}.`,
                                        inputLabel: 'Reply',
                                        placeholder: 'Write a short reply…',
                                        defaultValue: '',
                                        confirmText: 'Post reply',
                                        cancelText: 'Cancel',
                                      });
                                      if (reply === null) return;
                                      if (!reply?.trim()) {
                                        toast({ variant: 'danger', title: 'Empty reply', description: 'Type something before posting.' });
                                        return;
                                      }
                                      replyToPost(post.id, reply.trim());
                                      toast({ variant: 'success', title: 'Reply posted' });
                                    })();
                                }}
                                className="flex items-center text-slate-500 font-black text-[14px] tracking-[0.2em] uppercase hover:text-blue-500 transition-colors px-4 py-2 rounded-xl"
                             >
                                <MessageCircle size={20} className="mr-2" /> REPLY ({post.replies?.length || 0})
                            </button>
                        </div>
                      </div>
                    </BorderGlow>
                ))}
                
                <div className="flex justify-center py-12">
                    <Loader2 size={24} className="text-slate-200 dark:text-slate-700 animate-spin" />
                </div>
            </div>

            {/* Right Col - Leaderboard & Events */}
            <div className="w-full xl:w-96 flex flex-col gap-8">
                
                {/* Leaderboard */}
                <BorderGlow 
                  borderRadius={40}
                  backgroundColor="#060010"
                  className="animate-fade-in-up delay-200 shadow-xl shadow-slate-900/5 dark:shadow-none transition-all overflow-visible"
                >
                  <div className="p-8 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-900/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center uppercase tracking-tight">
                        <Trophy size={24} className="text-yellow-500 mr-3" /> Top Contributors
                    </h2>
                    
                    <div className="space-y-6 relative z-10">
                        {(leaderboard || []).map((userItem) => (
                            <div key={userItem.rank} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950 p-3 -mx-3 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:hover:border-slate-800 shadow-sm hover:shadow-md">
                                <div className="flex items-center space-x-4">
                                    <div className="w-8 flex justify-center filter drop-shadow-sm group-hover:scale-110 transition-transform">
                                        {userItem.rank === 1 ? <Trophy size={18} className="text-yellow-500" /> : 
                                         userItem.rank <= 3 ? <Award size={18} className="text-slate-400" /> : 
                                         <Star size={18} className="text-blue-400" />}
                                    </div>
                                     <div>
                                        <p className="font-black text-slate-900 dark:text-white text-sm leading-none mb-1 capitalize">{userItem.name}</p>
                                         <p className="text-[13px] uppercase font-black tracking-[0.2em] text-emerald-600 dark:text-emerald-400">{userItem.impact} IMPACT</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-slate-900 dark:text-white block leading-none">{userItem.donated}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button className="primary-button w-full mt-8 py-4 text-[16px]">View Rankings</button>
                  </div>
                </BorderGlow>

            </div>
        </div>
      </div>
    );
};
  
export default Community;
