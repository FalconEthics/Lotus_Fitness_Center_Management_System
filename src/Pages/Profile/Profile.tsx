import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  HiUser,
  HiCog6Tooth,
  HiEnvelope,
  HiPhone,
  HiCamera,
  HiCheckCircle,
  HiArrowPath,
  HiTrash,
  HiArrowDownTray,
  HiArrowUpTray,
  HiMoon,
  HiSun,
  HiBell,
  HiClock
} from 'react-icons/hi2';
import { Card, Button, Input, Badge } from '../../components/ui';
import { StatCard } from '../../components/StatCard';
import { useDataset, useDatasetDispatch } from '../../contexts/DatasetContext';
import { UserProfile } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

export function Profile(): JSX.Element {
  const dataset = useDataset();
  const dispatch = useDatasetDispatch();
  
  // User profile state
  const [profile, setProfile] = useState<UserProfile>({
    id: 1,
    name: 'Admin User',
    email: 'admin@lotus.fit',
    phone: '+44 20 1234 5678',
    role: 'Administrator',
    avatar: '',
    preferences: {
      theme: 'light',
      autoSaveInterval: 5,
      notifications: true,
      language: 'en',
      dateFormat: 'dd/MM/yyyy',
      timeFormat: '24h'
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserProfile>(profile);

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        setEditData(parsedProfile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', profile.preferences.theme);
    localStorage.setItem('theme', profile.preferences.theme);
  }, [profile.preferences.theme]);

  const handleSave = () => {
    setProfile(editData);
    localStorage.setItem('userProfile', JSON.stringify(editData));
    
    // Update user profile in context
    dispatch({
      type: 'UPDATE_USER_PROFILE',
      payload: editData
    });
    
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  const handleResetData = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset all data? This will delete all members, classes, trainers, and attendance records. This action cannot be undone.'
    );
    
    if (confirmReset) {
      dispatch({ type: 'RESET_ALL_DATA' });
      toast.success('All data has been reset successfully!');
    }
  };

  const handleExportData = () => {
    try {
      const dataToExport = {
        ...dataset,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lotus-fitness-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate the imported data structure
        if (!importedData.members || !importedData.classes) {
          throw new Error('Invalid data format');
        }
        
        dispatch({
          type: 'IMPORT_DATA',
          payload: importedData
        });
        
        toast.success('Data imported successfully!');
      } catch (error) {
        toast.error('Failed to import data. Please check the file format.');
        console.error('Import error:', error);
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  // Statistics
  const stats = [
    {
      title: 'Total Members',
      value: dataset.members.length,
      icon: HiUser,
      color: 'blue' as const
    },
    {
      title: 'Active Classes',
      value: dataset.classes.length,
      icon: HiCog6Tooth,
      color: 'green' as const
    },
    {
      title: 'Trainers',
      value: dataset.trainers.length,
      icon: HiUser,
      color: 'yellow' as const
    },
    {
      title: 'Attendance Records',
      value: dataset.attendanceRecords.length,
      icon: HiClock,
      color: 'gray' as const
    }
  ];

  return (
    <motion.div
      className="min-h-screen bg-base-100 p-6"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-base-content">User Profile</h1>
            <p className="text-base-content/70">Manage your account and app preferences</p>
          </div>
          
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? 'outline' : 'primary'}
            icon={isEditing ? <HiArrowPath className="h-5 w-5" /> : <HiCog6Tooth className="h-5 w-5" />}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    {profile.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt={profile.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <HiCamera className="h-4 w-4 text-primary-content" />
                    </button>
                  )}
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-base-content">{profile.name}</h2>
                  <p className="text-base-content/60">{profile.role}</p>
                  <Badge variant="success" size="sm" className="mt-1">
                    Active
                  </Badge>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={isEditing ? editData.name : profile.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  startIcon={<HiUser className="h-4 w-4" />}
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  value={isEditing ? editData.email : profile.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  startIcon={<HiEnvelope className="h-4 w-4" />}
                />
                
                <Input
                  label="Phone Number"
                  value={isEditing ? editData.phone : profile.phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!isEditing}
                  startIcon={<HiPhone className="h-4 w-4" />}
                />
                
                <Input
                  label="Role"
                  value={profile.role}
                  disabled
                />
              </div>

              {isEditing && (
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-base-300">
                  <Button
                    onClick={handleSave}
                    variant="primary"
                    icon={<HiCheckCircle className="h-4 w-4" />}
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* App Preferences */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Theme Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                <HiSun className="h-5 w-5" />
                Theme Settings
              </h3>
              
              <div className="space-y-4">
                <div className="btn-group w-full">
                  <Button
                    variant={profile.preferences.theme === 'light' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const newProfile = { 
                        ...profile, 
                        preferences: { ...profile.preferences, theme: 'light' as const }
                      };
                      setProfile(newProfile);
                      localStorage.setItem('userProfile', JSON.stringify(newProfile));
                      dispatch({
                        type: 'UPDATE_USER_PROFILE',
                        payload: newProfile
                      });
                    }}
                    icon={<HiSun className="h-4 w-4" />}
                    className="flex-1"
                  >
                    Light
                  </Button>
                  <Button
                    variant={profile.preferences.theme === 'dark' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const newProfile = { 
                        ...profile, 
                        preferences: { ...profile.preferences, theme: 'dark' as const }
                      };
                      setProfile(newProfile);
                      localStorage.setItem('userProfile', JSON.stringify(newProfile));
                      dispatch({
                        type: 'UPDATE_USER_PROFILE',
                        payload: newProfile
                      });
                    }}
                    icon={<HiMoon className="h-4 w-4" />}
                    className="flex-1"
                  >
                    Dark
                  </Button>
                </div>
              </div>
            </Card>

            {/* Auto-save Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                <HiClock className="h-5 w-5" />
                Auto-save Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-2">
                    Auto-save Interval (minutes)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={profile.preferences.autoSaveInterval}
                    onChange={(e) => {
                      const newProfile = { 
                        ...profile, 
                        preferences: { 
                          ...profile.preferences, 
                          autoSaveInterval: parseInt(e.target.value) 
                        }
                      };
                      setProfile(newProfile);
                      localStorage.setItem('userProfile', JSON.stringify(newProfile));
                      dispatch({
                        type: 'UPDATE_USER_PROFILE',
                        payload: newProfile
                      });
                    }}
                    className="range range-primary w-full"
                  />
                  <div className="flex justify-between text-sm text-base-content/60 mt-1">
                    <span>1 min</span>
                    <span className="font-medium">{profile.preferences.autoSaveInterval} min</span>
                    <span>30 min</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-base-content">Notifications</span>
                  <input
                    type="checkbox"
                    checked={profile.preferences.notifications}
                    onChange={(e) => {
                      const newProfile = { 
                        ...profile, 
                        preferences: { 
                          ...profile.preferences, 
                          notifications: e.target.checked 
                        }
                      };
                      setProfile(newProfile);
                      localStorage.setItem('userProfile', JSON.stringify(newProfile));
                      dispatch({
                        type: 'UPDATE_USER_PROFILE',
                        payload: newProfile
                      });
                    }}
                    className="checkbox checkbox-primary"
                  />
                </div>
              </div>
            </Card>

            {/* Data Management */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                <HiCog6Tooth className="h-5 w-5" />
                Data Management
              </h3>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  icon={<HiArrowDownTray className="h-4 w-4" />}
                  fullWidth
                >
                  Export Data
                </Button>
                
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    id="import-file"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('import-file')?.click()}
                    icon={<HiArrowUpTray className="h-4 w-4" />}
                    fullWidth
                  >
                    Import Data
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetData}
                  icon={<HiTrash className="h-4 w-4" />}
                  className="text-error hover:bg-error/10 border-error/30"
                  fullWidth
                >
                  Reset All Data
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}