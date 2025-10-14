import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { loadProfile, updateProfile, saveProfile } from '@/utils/profileManager';
import { UserProfile } from '@/types/profile';
import ProfileCard from '@/components/ProfileCard';
import AvatarCustomizer from '@/components/AvatarCustomizer';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: '', bio: '' });

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
          /* Profile Display */
          <ProfileCard profile={profile} />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
