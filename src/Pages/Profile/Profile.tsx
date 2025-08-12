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
  HiClock,
  HiKey,
  HiShieldCheck,
  HiEye,
  HiEyeSlash,
  HiExclamationTriangle
} from 'react-icons/hi2';
import { Card, Button, Input, Badge } from '../../components/ui';
import { StatCard } from '../../components/StatCard';
import { useDataset, useDatasetDispatch, datasetActions } from '../../contexts/DatasetContext';
import { UserProfile } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  getCurrentUsername, 
  changePassword, 
  changeUsername,
  validatePasswordStrength,
  logout
} from '../../utils/auth';
import { 
  canFitInLocalStorage, 
  getLocalStorageUsage, 
  createLightDemoData,
  formatBytes
} from '../../utils/storageManager';
import { useNavigate } from 'react-router';

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
  const navigate = useNavigate();
  
  // User profile state
  const [profile, setProfile] = useState<UserProfile>({
    id: 1,
    name: dataset.userProfile.name || 'Admin User',
    email: dataset.userProfile.email || 'admin@lotus.fit',
    phone: dataset.userProfile.phone || '+44 20 1234 5678',
    role: dataset.userProfile.role || 'Owner',
    avatar: '',
    preferences: dataset.userProfile.preferences || {
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

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    showPasswordForm: false,
    showUsernameForm: false,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    newUsername: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
  });

  // Data management state  
  const [dataManagement, setDataManagement] = useState({
    showImportWarning: false,
    pendingImportFile: null as File | null
  });

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

  // Security Functions
  const handlePasswordChange = () => {
    const { currentPassword, newPassword, confirmPassword } = securitySettings;

    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      toast.error(validation.feedback.join('. '));
      return;
    }

    const result = changePassword(currentPassword, newPassword);
    
    if (result.success) {
      toast.success(result.message);
      setSecuritySettings({
        ...securitySettings,
        showPasswordForm: false,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      toast.error(result.message);
    }
  };

  const handleUsernameChange = () => {
    const { currentPassword, newUsername } = securitySettings;

    if (!currentPassword) {
      toast.error('Password is required to change username');
      return;
    }

    if (!newUsername.trim()) {
      toast.error('New username is required');
      return;
    }

    const result = changeUsername(currentPassword, newUsername.trim());
    
    if (result.success) {
      toast.success(result.message);
      setSecuritySettings({
        ...securitySettings,
        showUsernameForm: false,
        currentPassword: '',
        newUsername: '',
      });
      
      // Update profile display
      setProfile({
        ...profile,
        name: newUsername
      });
    } else {
      toast.error(result.message);
    }
  };

  const handleResetData = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset all data? This will delete all members, classes, trainers, and attendance records. This action cannot be undone.'
    );
    
    if (confirmReset) {
      // Clear localStorage first
      localStorage.removeItem('lotus-fitness-data');
      localStorage.removeItem('userProfile');
      
      // Reset the dataset context
      dispatch(datasetActions.resetAllData());
      
      // Reset local profile state to default
      const defaultProfile: UserProfile = {
        id: 1,
        name: 'Admin User',
        email: 'admin@lotus-fitness.com',
        phone: '+44 20 1234 5678',
        role: 'Owner',
        avatar: '',
        preferences: {
          theme: 'light',
          autoSaveInterval: 5,
          notifications: true,
          language: 'en',
          dateFormat: 'dd/MM/yyyy',
          timeFormat: '24h',
          defaultView: 'dashboard'
        }
      };
      
      setProfile(defaultProfile);
      setEditData(defaultProfile);
      
      toast.success('All data has been reset successfully!');
    }
  };

  const handleExportData = () => {
    try {
      const dataToExport = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        appVersion: '2.0.0',
        exportedBy: `${dataset.userProfile.name} (${dataset.userProfile.role})`,
        totalRecords: {
          members: dataset.members.length,
          classes: dataset.classes.length,
          trainers: dataset.trainers.length,
          membershipPlans: dataset.membershipPlans.length,
          attendanceRecords: dataset.attendance.length
        },
        ...dataset
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

    // Check if there's existing data that would be overwritten
    const hasExistingData = dataset.members.length > 0 || 
                           dataset.classes.length > 0 || 
                           dataset.trainers.length > 0 ||
                           dataset.attendance.length > 0;

    if (hasExistingData) {
      setDataManagement({
        ...dataManagement,
        showImportWarning: true,
        pendingImportFile: file
      });
    } else {
      processImportFile(file);
    }

    event.target.value = ''; // Reset file input
  };

  const processImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Basic validation of required fields
        if (!importedData || typeof importedData !== 'object') {
          throw new Error('Invalid JSON format');
        }
        
        // Extract only dataset fields, ignore metadata for import
        const { exportDate, version, appVersion, exportedBy, totalRecords, ...datasetFields } = importedData;
        
        // Create validated data structure with safe defaults
        let validatedData = {
          userProfile: datasetFields.userProfile || profile,
          members: Array.isArray(datasetFields.members) ? datasetFields.members : [],
          classes: Array.isArray(datasetFields.classes) ? datasetFields.classes : [],
          trainers: Array.isArray(datasetFields.trainers) ? datasetFields.trainers : [],
          membershipPlans: Array.isArray(datasetFields.membershipPlans) ? datasetFields.membershipPlans : [],
          attendance: Array.isArray(datasetFields.attendance) ? datasetFields.attendance : []
        };
        
        // Check if data can fit in localStorage
        const storageCheck = canFitInLocalStorage(validatedData);
        
        if (!storageCheck.canFit) {
          const shouldCreateLight = window.confirm(
            `The imported data is too large (${storageCheck.sizeFormatted}) for localStorage. ` +
            `Would you like to import a lighter version with reduced attendance records? ` +
            `\n\nClick OK for lighter version, Cancel to abort import.`
          );
          
          if (shouldCreateLight) {
            validatedData = createLightDemoData(validatedData);
            const lightCheck = canFitInLocalStorage(validatedData);
            
            if (!lightCheck.canFit) {
              throw new Error(`Even the light version (${lightCheck.sizeFormatted}) is too large. Please use a smaller dataset.`);
            }
            
            toast.success(`Using lighter version of data (${lightCheck.sizeFormatted})`);
          } else {
            return; // User cancelled
          }
        } else if (storageCheck.isNearLimit) {
          toast.warning(`Large dataset detected (${storageCheck.sizeFormatted}). This may impact app performance.`);
        }
        
        // Clear localStorage first to ensure clean import
        localStorage.removeItem('lotus-fitness-data');
        localStorage.removeItem('userProfile');
        
        // Import the validated data
        dispatch(datasetActions.importData(validatedData));
        
        // Update local profile state if userProfile exists in import
        if (validatedData.userProfile) {
          setProfile(validatedData.userProfile);
          setEditData(validatedData.userProfile);
        }
        
        toast.success(
          `Data imported successfully! Imported ${validatedData.members.length} members, ` +
          `${validatedData.classes.length} classes, ${validatedData.trainers.length} trainers, ` +
          `${validatedData.attendance.length} attendance records.`
        );
        
        setDataManagement({
          ...dataManagement,
          showImportWarning: false,
          pendingImportFile: null
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Failed to import data: ${errorMessage}`);
        console.error('Import error:', error);
        console.log('Import data structure:', importedData); // Debug log
      }
    };
    
    reader.onerror = () => {
      toast.error('Failed to read file. Please try again.');
    };
    
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (dataManagement.pendingImportFile) {
      processImportFile(dataManagement.pendingImportFile);
    }
  };

  const cancelImport = () => {
    setDataManagement({
      ...dataManagement,
      showImportWarning: false,
      pendingImportFile: null
    });
  };

  // Statistics
  const storageUsage = getLocalStorageUsage();
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
      value: dataset.attendance.length,
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

            {/* Security Settings */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                <HiShieldCheck className="h-5 w-5" />
                Security Settings
              </h3>
              
              <div className="space-y-3">
                <div className="text-sm text-base-content/70 mb-3">
                  Current Username: <span className="font-medium text-base-content">{getCurrentUsername()}</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSecuritySettings({...securitySettings, showUsernameForm: !securitySettings.showUsernameForm, showPasswordForm: false})}
                  icon={<HiUser className="h-4 w-4" />}
                  fullWidth
                >
                  Change Username
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSecuritySettings({...securitySettings, showPasswordForm: !securitySettings.showPasswordForm, showUsernameForm: false})}
                  icon={<HiKey className="h-4 w-4" />}
                  fullWidth
                >
                  Change Password
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    toast.success('Logged out successfully');
                    navigate('/login');
                  }}
                  icon={<HiArrowPath className="h-4 w-4" />}
                  className="text-warning hover:bg-warning/10 border-warning/30"
                  fullWidth
                >
                  Logout
                </Button>
              </div>
              
              {/* Username Change Form */}
              {securitySettings.showUsernameForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-base-300 pt-4 mt-4 space-y-3"
                >
                  <Input
                    label="New Username"
                    value={securitySettings.newUsername}
                    onChange={(e) => setSecuritySettings({...securitySettings, newUsername: e.target.value})}
                    placeholder="Enter new username"
                  />
                  
                  <div className="relative">
                    <Input
                      label="Confirm Password"
                      type={securitySettings.showCurrentPassword ? 'text' : 'password'}
                      value={securitySettings.currentPassword}
                      onChange={(e) => setSecuritySettings({...securitySettings, currentPassword: e.target.value})}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-base-content/50 hover:text-base-content"
                      onClick={() => setSecuritySettings({...securitySettings, showCurrentPassword: !securitySettings.showCurrentPassword})}
                    >
                      {securitySettings.showCurrentPassword ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleUsernameChange}
                      className="flex-1"
                    >
                      Update Username
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSecuritySettings({...securitySettings, showUsernameForm: false, currentPassword: '', newUsername: ''})}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {/* Password Change Form */}
              {securitySettings.showPasswordForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-base-300 pt-4 mt-4 space-y-3"
                >
                  <div className="relative">
                    <Input
                      label="Current Password"
                      type={securitySettings.showCurrentPassword ? 'text' : 'password'}
                      value={securitySettings.currentPassword}
                      onChange={(e) => setSecuritySettings({...securitySettings, currentPassword: e.target.value})}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-base-content/50 hover:text-base-content"
                      onClick={() => setSecuritySettings({...securitySettings, showCurrentPassword: !securitySettings.showCurrentPassword})}
                    >
                      {securitySettings.showCurrentPassword ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <Input
                      label="New Password"
                      type={securitySettings.showNewPassword ? 'text' : 'password'}
                      value={securitySettings.newPassword}
                      onChange={(e) => setSecuritySettings({...securitySettings, newPassword: e.target.value})}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-base-content/50 hover:text-base-content"
                      onClick={() => setSecuritySettings({...securitySettings, showNewPassword: !securitySettings.showNewPassword})}
                    >
                      {securitySettings.showNewPassword ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  <div className="relative">
                    <Input
                      label="Confirm New Password"
                      type={securitySettings.showConfirmPassword ? 'text' : 'password'}
                      value={securitySettings.confirmPassword}
                      onChange={(e) => setSecuritySettings({...securitySettings, confirmPassword: e.target.value})}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-base-content/50 hover:text-base-content"
                      onClick={() => setSecuritySettings({...securitySettings, showConfirmPassword: !securitySettings.showConfirmPassword})}
                    >
                      {securitySettings.showConfirmPassword ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {securitySettings.newPassword && (
                    <div className="text-xs space-y-1">
                      {(() => {
                        const validation = validatePasswordStrength(securitySettings.newPassword);
                        return (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span>Password Strength:</span>
                              <div className={`badge badge-sm ${
                                validation.score <= 2 ? 'badge-error' :
                                validation.score <= 4 ? 'badge-warning' :
                                'badge-success'
                              }`}>
                                {validation.score <= 2 ? 'Weak' :
                                 validation.score <= 4 ? 'Medium' : 'Strong'}
                              </div>
                            </div>
                            {validation.feedback.length > 0 && (
                              <ul className="list-disc list-inside text-base-content/60 space-y-1">
                                {validation.feedback.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })()} 
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handlePasswordChange}
                      className="flex-1"
                    >
                      Update Password
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSecuritySettings({...securitySettings, showPasswordForm: false, currentPassword: '', newPassword: '', confirmPassword: ''})}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </Card>

            {/* Data Management */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-base-content mb-4 flex items-center gap-2">
                <HiCog6Tooth className="h-5 w-5" />
                Data Management
              </h3>
              
              {/* Storage Usage */}
              <div className="mb-4 p-3 bg-base-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Storage Usage</span>
                  <span className="text-sm text-base-content/70">{storageUsage.usedFormatted}</span>
                </div>
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      storageUsage.percentUsed > 80 ? 'bg-error' :
                      storageUsage.percentUsed > 60 ? 'bg-warning' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(storageUsage.percentUsed, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-base-content/60 mt-1">
                  {storageUsage.percentUsed.toFixed(1)}% used
                  {storageUsage.percentUsed > 80 && (
                    <span className="text-error ml-2">Storage nearly full!</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  icon={<HiArrowDownTray className="h-4 w-4" />}
                  fullWidth
                >
                  Export Backup
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
                    Import Backup
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

      {/* Import Warning Modal */}
      {dataManagement.showImportWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <HiExclamationTriangle className="h-6 w-6 text-warning" />
              <h3 className="text-lg font-semibold">Overwrite Existing Data?</h3>
            </div>
            
            <div className="mb-4 text-base-content/70">
              <p className="mb-2">
                You have existing data that will be completely replaced:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {dataset.members.length > 0 && <li>{dataset.members.length} members</li>}
                {dataset.classes.length > 0 && <li>{dataset.classes.length} classes</li>}
                {dataset.trainers.length > 0 && <li>{dataset.trainers.length} trainers</li>}
                {dataset.attendance.length > 0 && <li>{dataset.attendance.length} attendance records</li>}
              </ul>
              <p className="mt-2 font-medium text-warning">
                This action cannot be undone!
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={confirmImport}
                icon={<HiArrowUpTray className="h-4 w-4" />}
                className="flex-1 bg-warning text-warning-content hover:bg-warning/90"
              >
                Yes, Import
              </Button>
              <Button
                variant="outline"
                onClick={cancelImport}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}