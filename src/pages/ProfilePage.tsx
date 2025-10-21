import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { loadProfile, updateProfile, saveProfile } from '@/utils/profileManager';
import { UserProfile } from '@/types/profile';
import ProfileCard from '@/components/ProfileCard';
import AvatarCustomizer from '@/components/AvatarCustomizer';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Save, X, Trophy, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAchievements } from '@/components/AchievementSystem';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', bio: '' });
  const { achievements } = useAchievements();

  useEffect(() => {
    const loadedProfile = loadProfile();
    setProfile(loadedProfile);
    setEditForm({
      displayName: loadedProfile.displayName,
      bio: loadedProfile.bio
    });
  }, []);

  const handleAvatarSave = (newAvatar: typeof profile.avatar) => {
    if (!profile) return;
    const updated = updateProfile({ avatar: newAvatar });
    setProfile(updated);
    setIsEditingAvatar(false);
    toast.success('Avatar updated!');
  };

  const handleProfileSave = () => {
    if (!profile) return;
    const updated = updateProfile({
      displayName: editForm.displayName,
      bio: editForm.bio
    });
    setProfile(updated);
    setIsEditingProfile(false);
    toast.success('Profile updated!');
  };

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <ThemeToggle />
      
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quiz
          </Button>
          
          {!isEditingAvatar && !isEditingProfile && (
            <Button
              variant="default"
              onClick={() => setIsEditingProfile(true)}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Avatar Customizer */}
        {isEditingAvatar ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="holographic-card animated-gradient-border rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Customize Avatar</h2>
            <AvatarCustomizer
              initialAvatar={profile.avatar}
              onSave={handleAvatarSave}
              onCancel={() => setIsEditingAvatar(false)}
            />
          </motion.div>
        ) : isEditingProfile ? (
          /* Profile Editor */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="holographic-card animated-gradient-border rounded-2xl p-8 space-y-6"
          >
            <h2 className="text-2xl font-bold text-center">Edit Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-card border border-accent/30 focus:border-accent outline-none"
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-card border border-accent/30 focus:border-accent outline-none resize-none"
                  rows={3}
                  maxLength={150}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {editForm.bio.length}/150 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-4">Avatar</label>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setIsEditingAvatar(true);
                  }}
                  className="w-full"
                >
                  Customize Avatar
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingProfile(false);
                  setEditForm({
                    displayName: profile.displayName,
                    bio: profile.bio
                  });
                }}
                className="flex-1 gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                onClick={handleProfileSave}
                className="flex-1 gap-2 bg-gradient-accent"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Profile Display */}
            <ProfileCard profile={profile} />
            
            {/* Achievements Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="holographic-card animated-gradient-border rounded-2xl p-8 mt-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-bold">Achievements</h2>
                <span className="ml-auto text-sm text-muted-foreground">
                  {achievements.filter(a => a.unlocked).length} / {achievements.length} Unlocked
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      achievement.unlocked
                        ? achievement.rarity === 'legendary'
                          ? 'border-amber-500 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 shadow-lg shadow-amber-500/20'
                          : achievement.rarity === 'epic'
                          ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
                          : achievement.rarity === 'rare'
                          ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 shadow-lg shadow-blue-500/20'
                          : 'border-slate-500 bg-gradient-to-br from-slate-500/20 to-gray-500/20'
                        : 'border-gray-700 bg-gray-800/30 opacity-60'
                    }`}
                  >
                    {/* Lock overlay for locked achievements */}
                    {!achievement.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-sm">
                        <Lock className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className={`text-4xl ${!achievement.unlocked && 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm mb-1 truncate">{achievement.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {achievement.description}
                        </p>
                        
                        {/* Progress bar */}
                        {achievement.maxProgress > 1 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-semibold">
                                {achievement.progress} / {achievement.maxProgress}
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-accent transition-all duration-500"
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Rarity badge */}
                        <div className="mt-2">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            achievement.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400' :
                            achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                            achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {achievement.rarity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
