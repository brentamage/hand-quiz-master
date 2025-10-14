import { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AVATAR_COLORS } from '@/types/profile';
import AvatarDisplay from './AvatarDisplay';
import { Button } from './ui/button';
import { Palette, Sparkles, Shapes, Image } from 'lucide-react';

interface AvatarCustomizerProps {
  initialAvatar: Avatar;
  onSave: (avatar: Avatar) => void;
  onCancel?: () => void;
}

const AvatarCustomizer = ({ initialAvatar, onSave, onCancel }: AvatarCustomizerProps) => {
  const [avatar, setAvatar] = useState<Avatar>(initialAvatar);
  const [activeTab, setActiveTab] = useState<'style' | 'colors' | 'pattern' | 'accessory'>('style');

  const styles: Avatar['style'][] = ['robot', 'geometric', 'gradient', 'pixel', 'abstract'];
  const patterns: Avatar['pattern'][] = ['solid', 'stripes', 'dots', 'waves', 'grid'];
  const accessories: Avatar['accessory'][] = ['none', 'glasses', 'hat', 'crown', 'headphones'];
  const backgrounds: Avatar['background'][] = ['solid', 'gradient', 'pattern'];

  const updateAvatar = (updates: Partial<Avatar>) => {
    setAvatar(prev => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    onSave(avatar);
  };

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="flex justify-center">
        <motion.div
          key={JSON.stringify(avatar)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AvatarDisplay avatar={avatar} size="xl" />
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 justify-center flex-wrap">
        <Button
          variant={activeTab === 'style' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('style')}
          className="gap-2"
        >
          <Shapes className="w-4 h-4" />
          Style
        </Button>
        <Button
          variant={activeTab === 'colors' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('colors')}
          className="gap-2"
        >
          <Palette className="w-4 h-4" />
          Colors
        </Button>
        <Button
          variant={activeTab === 'pattern' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('pattern')}
          className="gap-2"
        >
          <Image className="w-4 h-4" />
          Pattern
        </Button>
        <Button
          variant={activeTab === 'accessory' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('accessory')}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Accessory
        </Button>
      </div>

      {/* Options */}
      <div className="holographic-card animated-gradient-border rounded-xl p-6">
        {activeTab === 'style' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Choose Avatar Style</h3>
            <div className="grid grid-cols-5 gap-4">
              {styles.map((style) => (
                <motion.button
                  key={style}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateAvatar({ style })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    avatar.style === style
                      ? 'border-accent bg-accent/10'
                      : 'border-accent/20 hover:border-accent/50'
                  }`}
                >
                  <AvatarDisplay 
                    avatar={{ ...avatar, style }} 
                    size="md" 
                    showBorder={false}
                  />
                  <p className="text-xs mt-2 capitalize">{style}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-center mb-4">Primary Color</h3>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(AVATAR_COLORS).map(([name, color]) => (
                  <motion.button
                    key={name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateAvatar({ primaryColor: color })}
                    className={`w-12 h-12 rounded-full border-4 transition-all ${
                      avatar.primaryColor === color
                        ? 'border-white shadow-lg'
                        : 'border-transparent'
                    }`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-center mb-4">Secondary Color</h3>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(AVATAR_COLORS).map(([name, color]) => (
                  <motion.button
                    key={name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateAvatar({ secondaryColor: color })}
                    className={`w-12 h-12 rounded-full border-4 transition-all ${
                      avatar.secondaryColor === color
                        ? 'border-white shadow-lg'
                        : 'border-transparent'
                    }`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-center mb-4">Background</h3>
              <div className="flex gap-3 justify-center">
                {backgrounds.map((bg) => (
                  <Button
                    key={bg}
                    variant={avatar.background === bg ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateAvatar({ background: bg })}
                    className="capitalize"
                  >
                    {bg}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pattern' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Choose Pattern</h3>
            <div className="grid grid-cols-5 gap-4">
              {patterns.map((pattern) => (
                <motion.button
                  key={pattern}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateAvatar({ pattern })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    avatar.pattern === pattern
                      ? 'border-accent bg-accent/10'
                      : 'border-accent/20 hover:border-accent/50'
                  }`}
                >
                  <AvatarDisplay 
                    avatar={{ ...avatar, pattern }} 
                    size="md" 
                    showBorder={false}
                  />
                  <p className="text-xs mt-2 capitalize">{pattern}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'accessory' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Add Accessory</h3>
            <div className="grid grid-cols-5 gap-4">
              {accessories.map((accessory) => (
                <motion.button
                  key={accessory}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateAvatar({ accessory })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    avatar.accessory === accessory
                      ? 'border-accent bg-accent/10'
                      : 'border-accent/20 hover:border-accent/50'
                  }`}
                >
                  <AvatarDisplay 
                    avatar={{ ...avatar, accessory }} 
                    size="md" 
                    showBorder={false}
                  />
                  <p className="text-xs mt-2 capitalize">{accessory}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-8"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSave}
          className="px-8 bg-gradient-accent"
        >
          Save Avatar
        </Button>
      </div>
    </div>
  );
};

export default AvatarCustomizer;
