import { useMemo, useState } from 'react';
import { useAppData } from '../context/appDataContext';
import BorderGlow from '../components/ui/BorderGlow';
import { useOverlay } from '../components/ui/overlayContext';
import { Activity, Heart, Megaphone, MessageCircle, Radio, Send, Sparkles, TrendingUp, Users } from 'lucide-react';

const CommunityLive = () => {
  const { user, communityPosts = [], foodListings = [], createPost, likePost, replyToPost } = useAppData();
  const { prompt, toast } = useOverlay();
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    try {
      await createPost(newPostContent.trim());
      setNewPostContent('');
      setIsPosting(false);
    } catch (err) {
      toast({ variant: 'danger', title: 'Post failed', description: err?.response?.data?.message || 'Could not post update.' });
    }
  };

  const pulse = useMemo(() => {
    const available = foodListings.filter((item) => item?.status === 'AVAILABLE');
    const accepted = foodListings.filter((item) => item?.status === 'ACCEPTED');
    const byLocation = new Map();
    available.forEach((item) => {
      const key = (item?.location || 'Unassigned zone').trim();
      byLocation.set(key, (byLocation.get(key) || 0) + (Number(item?.quantity) || 0));
    });
    const hotspot = [...byLocation.entries()].sort((a, b) => b[1] - a[1])[0];

    return {
      livePosts: communityPosts.length,
      rescueReady: available.length,
      activePickups: accepted.length,
      hotspot: hotspot ? hotspot[0] : 'Network-wide',
      hotspotKg: hotspot ? hotspot[1] : 0,
      totalReplies: communityPosts.reduce((sum, post) => sum + (post?.replies?.length || 0), 0),
      totalLikes: communityPosts.reduce((sum, post) => sum + (post?.likes || 0), 0),
    };
  }, [communityPosts, foodListings]);

  const suggestions = useMemo(
    () => [
      {
        title: 'Broadcast pickup urgency',
        detail: pulse.rescueReady > 0 ? `${pulse.rescueReady} listings are waiting for receivers right now.` : 'No unclaimed listings at the moment.',
      },
      {
        title: 'Focus the next route wave',
        detail: pulse.hotspotKg > 0 ? `${pulse.hotspot} currently has the highest available volume at ${pulse.hotspotKg.toFixed(1)} kg.` : 'No hotspot detected yet.',
      },
      {
        title: 'Keep conversation warm',
        detail: `${pulse.totalReplies} replies and ${pulse.totalLikes} likes are driving coordination across the feed.`,
      },
    ],
    [pulse]
  );

  return (
    <div className="flex flex-col h-full animate-fade-in-up transition-colors duration-300 p-6 md:p-10">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-[13px] font-black uppercase tracking-[0.2em] text-pink-700 dark:border-pink-900/60 dark:bg-pink-950/20 dark:text-pink-300">
            <Users size={15} /> Network Feed
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Coordination that feels alive
          </h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold text-slate-600 dark:text-slate-300 md:text-base">
            Live feed, route pulse, and operational suggestions in one place so the network can act faster than food expires.
          </p>
        </div>

        <button onClick={() => setIsPosting((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-emerald-600/25 transition-colors hover:bg-emerald-700">
          <Megaphone size={18} /> {isPosting ? 'Close composer' : 'Create update'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/35">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                <Radio size={14} /> Live posts
              </p>
              <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{pulse.livePosts}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Community updates and field coordination notes.</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/35">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                <Activity size={14} /> Rescue ready
              </p>
              <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{pulse.rescueReady}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Open listings that can be converted into action right now.</p>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/35">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                <TrendingUp size={14} /> Hotspot
              </p>
              <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white">{pulse.hotspot}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{pulse.hotspotKg ? `${pulse.hotspotKg.toFixed(1)} kg currently available` : 'No concentration spike detected yet.'}</p>
            </div>
          </div>

          {isPosting && (
            <BorderGlow borderRadius={36} backgroundColor="#060010" className="animate-fade-in-up overflow-visible shadow-xl shadow-slate-900/5 dark:shadow-none">
              <form onSubmit={handleCreatePost} className="p-6 md:p-8">
                <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">
                  <Send size={14} /> New broadcast
                </div>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share a rescue update, route note, or urgent pickup signal..."
                  className="mt-4 min-h-[140px] w-full rounded-3xl border border-slate-200 bg-slate-50 p-5 text-base font-semibold text-slate-900 shadow-inner transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
                <div className="mt-4 flex justify-end">
                  <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700">
                    <Send size={16} /> Post update
                  </button>
                </div>
              </form>
            </BorderGlow>
          )}

          <div className="space-y-5">
            {communityPosts.map((post) => (
              <BorderGlow key={post.id} borderRadius={32} backgroundColor="#060010" className="overflow-visible shadow-xl shadow-slate-900/5 dark:shadow-none">
                <div className="p-6 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/40 text-lg shadow-inner ${post.theme || 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200'}`}>
                        {post.icon || <Sparkles size={20} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{post.user}</h2>
                          <span className="rounded-full border border-slate-200/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                            {post.type || 'Update'}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">{post.time}</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                      Live
                    </div>
                  </div>

                  <p className="mt-5 text-base font-semibold leading-7 text-slate-700 dark:text-slate-300">{post.content}</p>

                  {(post.replies || []).length > 0 && (
                    <div className="mt-5 space-y-3 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800/80 dark:bg-slate-950/35">
                      {(post.replies || []).slice(-2).map((reply, index) => (
                        <div key={`${post.id}_reply_${index}`} className="rounded-2xl bg-white/90 px-4 py-3 dark:bg-slate-900/80">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{reply.user || 'Partner'}</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-200/80 pt-5 dark:border-slate-800/80">
                    <button onClick={async () => { try { await likePost(post.id); } catch {} }} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-pink-200 hover:text-pink-600 dark:border-slate-800 dark:text-slate-300 dark:hover:border-pink-900/60 dark:hover:text-pink-300">
                      <Heart size={16} /> {post.likes || 0} likes
                    </button>
                    <button
                      onClick={() => {
                        (async () => {
                          const reply = await prompt({
                            title: 'Reply to update',
                            description: `Replying as ${user?.name || 'Partner'}.`,
                            inputLabel: 'Reply',
                            placeholder: 'Write a short reply...',
                            defaultValue: '',
                            confirmText: 'Post reply',
                            cancelText: 'Cancel',
                          });
                          if (reply === null) return;
                          if (!reply?.trim()) {
                            toast({ variant: 'danger', title: 'Empty reply', description: 'Type something before posting.' });
                            return;
                          }
                          try {
                            await replyToPost(post.id, reply.trim());
                            toast({ variant: 'success', title: 'Reply posted' });
                          } catch (err) {
                            toast({ variant: 'danger', title: 'Failed', description: err?.response?.data?.message || 'Could not post reply.' });
                          }
                        })();
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-sky-200 hover:text-sky-600 dark:border-slate-800 dark:text-slate-300 dark:hover:border-sky-900/60 dark:hover:text-sky-300"
                    >
                      <MessageCircle size={16} /> {(post.replies || []).length} replies
                    </button>
                  </div>
                </div>
              </BorderGlow>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <BorderGlow borderRadius={36} backgroundColor="#060010" className="overflow-visible shadow-xl shadow-slate-900/5 dark:shadow-none">
            <div className="p-7">
              <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                <Sparkles size={20} /> Network pulse
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Replacing leaderboard noise with actionable signals from the live network state.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 dark:border-slate-800/80 dark:bg-slate-950/35">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Open rescue workload</p>
                  <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{pulse.rescueReady}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Listings still waiting for a receiver response.</p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 dark:border-slate-800/80 dark:bg-slate-950/35">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Active pickups</p>
                  <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{pulse.activePickups}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Accepted handoffs moving through the field right now.</p>
                </div>
              </div>
            </div>
          </BorderGlow>

          <BorderGlow borderRadius={36} backgroundColor="#060010" className="overflow-visible shadow-xl shadow-slate-900/5 dark:shadow-none">
            <div className="p-7">
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Suggested actions</h2>
              <div className="mt-5 space-y-4">
                {suggestions.map((item) => (
                  <div key={item.title} className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 dark:border-slate-800/80 dark:bg-slate-950/35">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </BorderGlow>
        </div>
      </div>
    </div>
  );
};

export default CommunityLive;
