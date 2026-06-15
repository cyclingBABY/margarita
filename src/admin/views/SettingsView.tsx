import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Trash2,
  Camera,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Upload,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/src/AuthContext';
import { auth, db } from '@/src/firebase';
import { updateProfile, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { UserRole } from '@/src/types';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationality?: string;
  role?: UserRole;
  profilePicture?: string;
}

// Country code mapping
const countryCodes: { [key: string]: string } = {
  'Afghanistan': '+93',
  'Albania': '+355',
  'Algeria': '+213',
  'Andorra': '+376',
  'Angola': '+244',
  'Antigua and Barbuda': '+1-268',
  'Argentina': '+54',
  'Armenia': '+374',
  'Australia': '+61',
  'Austria': '+43',
  'Azerbaijan': '+994',
  'Bahamas': '+1-242',
  'Bahrain': '+973',
  'Bangladesh': '+880',
  'Barbados': '+1-246',
  'Belarus': '+375',
  'Belgium': '+32',
  'Belize': '+501',
  'Benin': '+229',
  'Bhutan': '+975',
  'Bolivia': '+591',
  'Bosnia and Herzegovina': '+387',
  'Botswana': '+267',
  'Brazil': '+55',
  'Brunei': '+673',
  'Bulgaria': '+359',
  'Burkina Faso': '+226',
  'Burundi': '+257',
  'Cabo Verde': '+238',
  'Cambodia': '+855',
  'Cameroon': '+237',
  'Canada': '+1',
  'Central African Republic': '+236',
  'Chad': '+235',
  'Chile': '+56',
  'China': '+86',
  'Colombia': '+57',
  'Comoros': '+269',
  'Congo': '+242',
  'Costa Rica': '+506',
  'Croatia': '+385',
  'Cuba': '+53',
  'Cyprus': '+357',
  'Czech Republic': '+420',
  'Denmark': '+45',
  'Djibouti': '+253',
  'Dominica': '+1-767',
  'Dominican Republic': '+1-809',
  'East Timor': '+670',
  'Ecuador': '+593',
  'Egypt': '+20',
  'El Salvador': '+503',
  'Equatorial Guinea': '+240',
  'Eritrea': '+291',
  'Estonia': '+372',
  'Eswatini': '+268',
  'Ethiopia': '+251',
  'Fiji': '+679',
  'Finland': '+358',
  'France': '+33',
  'Gabon': '+241',
  'Gambia': '+220',
  'Georgia': '+995',
  'Germany': '+49',
  'Ghana': '+233',
  'Greece': '+30',
  'Grenada': '+1-473',
  'Guatemala': '+502',
  'Guinea': '+224',
  'Guinea-Bissau': '+245',
  'Guyana': '+592',
  'Haiti': '+509',
  'Honduras': '+504',
  'Hungary': '+36',
  'Iceland': '+354',
  'India': '+91',
  'Indonesia': '+62',
  'Iran': '+98',
  'Iraq': '+964',
  'Ireland': '+353',
  'Israel': '+972',
  'Italy': '+39',
  'Jamaica': '+1-876',
  'Japan': '+81',
  'Jordan': '+962',
  'Kazakhstan': '+7',
  'Kenya': '+254',
  'Kiribati': '+686',
  'Korea, North': '+850',
  'Korea, South': '+82',
  'Kosovo': '+383',
  'Kuwait': '+965',
  'Kyrgyzstan': '+996',
  'Laos': '+856',
  'Latvia': '+371',
  'Lebanon': '+961',
  'Lesotho': '+266',
  'Liberia': '+231',
  'Libya': '+218',
  'Liechtenstein': '+423',
  'Lithuania': '+370',
  'Luxembourg': '+352',
  'Madagascar': '+261',
  'Malawi': '+265',
  'Malaysia': '+60',
  'Maldives': '+960',
  'Mali': '+223',
  'Malta': '+356',
  'Marshall Islands': '+692',
  'Mauritania': '+222',
  'Mauritius': '+230',
  'Mexico': '+52',
  'Micronesia': '+691',
  'Moldova': '+373',
  'Monaco': '+377',
  'Mongolia': '+976',
  'Montenegro': '+382',
  'Morocco': '+212',
  'Mozambique': '+258',
  'Myanmar': '+95',
  'Namibia': '+264',
  'Nauru': '+674',
  'Nepal': '+977',
  'Netherlands': '+31',
  'New Zealand': '+64',
  'Nicaragua': '+505',
  'Niger': '+227',
  'Nigeria': '+234',
  'North Macedonia': '+389',
  'Norway': '+47',
  'Oman': '+968',
  'Pakistan': '+92',
  'Palau': '+680',
  'Palestine': '+970',
  'Panama': '+507',
  'Papua New Guinea': '+675',
  'Paraguay': '+595',
  'Peru': '+51',
  'Philippines': '+63',
  'Poland': '+48',
  'Portugal': '+351',
  'Qatar': '+974',
  'Romania': '+40',
  'Russia': '+7',
  'Rwanda': '+250',
  'Saint Kitts and Nevis': '+1-869',
  'Saint Lucia': '+1-758',
  'Saint Vincent and the Grenadines': '+1-784',
  'Samoa': '+685',
  'San Marino': '+378',
  'Sao Tome and Principe': '+239',
  'Saudi Arabia': '+966',
  'Senegal': '+221',
  'Serbia': '+381',
  'Seychelles': '+248',
  'Sierra Leone': '+232',
  'Singapore': '+65',
  'Slovakia': '+421',
  'Slovenia': '+386',
  'Solomon Islands': '+677',
  'Somalia': '+252',
  'South Africa': '+27',
  'South Sudan': '+211',
  'Spain': '+34',
  'Sri Lanka': '+94',
  'Sudan': '+249',
  'Suriname': '+597',
  'Sweden': '+46',
  'Switzerland': '+41',
  'Syria': '+963',
  'Taiwan': '+886',
  'Tajikistan': '+992',
  'Tanzania': '+255',
  'Thailand': '+66',
  'Togo': '+228',
  'Tonga': '+676',
  'Trinidad and Tobago': '+1-868',
  'Tunisia': '+216',
  'Turkey': '+90',
  'Turkmenistan': '+993',
  'Tuvalu': '+688',
  'Uganda': '+256',
  'Ukraine': '+380',
  'United Arab Emirates': '+971',
  'United Kingdom': '+44',
  'United States': '+1',
  'Uruguay': '+598',
  'Uzbekistan': '+998',
  'Vanuatu': '+678',
  'Vatican City': '+379',
  'Venezuela': '+58',
  'Vietnam': '+84',
  'Yemen': '+967',
  'Zambia': '+260',
  'Zimbabwe': '+263'
};

export const SettingsView = ({ role }: { role: string }) => {
  const { user, profile, setProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState<UserProfile>({
    uid: user?.uid || '',
    email: user?.email || '',
    displayName: user?.displayName || '',
    phoneNumber: profile?.phoneNumber || '',
    dateOfBirth: profile?.dateOfBirth || '',
    nationality: profile?.nationality || '',
    role: (profile?.role || role) as UserRole
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setProfileData({
        uid: user?.uid || '',
        email: user?.email || '',
        displayName: user?.displayName || profile.displayName || '',
        phoneNumber: profile.phoneNumber || '',
        dateOfBirth: profile.dateOfBirth || '',
        nationality: profile.nationality || '',
        role: (profile.role || role) as UserRole
      });
    }
  }, [profile, user, role]);

  // Update phone number when nationality changes
  useEffect(() => {
    if (profileData.nationality && countryCodes[profileData.nationality]) {
      const countryCode = countryCodes[profileData.nationality];
      
      // If phone number is empty, set the country code
      if (!profileData.phoneNumber) {
        setProfileData(prev => ({ ...prev, phoneNumber: countryCode + ' ' }));
      } 
      // If phone number starts with a different country code, replace it
      else {
        const currentCode = Object.values(countryCodes).find(code => profileData.phoneNumber.startsWith(code));
        if (currentCode && currentCode !== countryCode) {
          const remainingNumber = profileData.phoneNumber.replace(currentCode, '').trim();
          setProfileData(prev => ({ ...prev, phoneNumber: countryCode + ' ' + remainingNumber }));
        }
        // If no country code is present, prepend it
        else if (!currentCode) {
          setProfileData(prev => ({ ...prev, phoneNumber: countryCode + ' ' + profileData.phoneNumber }));
        }
      }
    }
  }, [profileData.nationality]);

  const handleProfileUpdate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: profileData.displayName
      });

      // Update database via API
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/auth/profile/${user.uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName: profileData.displayName,
          phoneNumber: profileData.phoneNumber,
          dateOfBirth: profileData.dateOfBirth,
          nationality: profileData.nationality,
          profilePicture: profile?.profilePicture || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile in database');
      }

      // Update Firestore profile
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: profileData.displayName,
        phoneNumber: profileData.phoneNumber,
        dateOfBirth: profileData.dateOfBirth,
        nationality: profileData.nationality,
        updatedAt: new Date()
      });

      // Update local profile state
      setProfile({
        ...profile,
        ...profileData
      });

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user || !user.email) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordData.newPassword);

      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast.success('Password changed successfully!');
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error('Failed to change password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicturePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePicture || !user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('profilePicture', profilePicture);

      // Upload to server
      const uploadResponse = await fetch(`/api/auth/profile/${user.uid}/picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload profile picture to server');
      }

      const uploadData = await uploadResponse.json();
      const profilePictureUrl = uploadData.profilePictureUrl;

      // Update Firestore profile
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        profilePicture: profilePictureUrl,
        updatedAt: new Date()
      });

      // Update local profile state
      setProfile({
        ...profile,
        profilePicture: profilePictureUrl
      });

      setProfilePicture(null);
      setProfilePicturePreview(null);
      toast.success('Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      toast.error('Failed to upload profile picture: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !user.email) return;

    setLoading(true);
    try {
      // Delete from database via API
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/auth/profile/${user.uid}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete account from database');
      }

      // Delete from Firestore
      const userRef = doc(db, 'users', user.uid);
      await deleteDoc(userRef);

      // Delete from Firebase Auth
      await deleteUser(user);

      toast.success('Account deleted successfully');
      // User will be redirected by auth state change
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast.error('Failed to delete account: ' + error.message);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-hotel-gold/10 p-3 rounded-lg">
          <User className="h-6 w-6 text-hotel-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-hotel-blue">Account Settings</h1>
          <p className="text-slate-600">Manage your profile, security, and account preferences</p>
        </div>
      </div>

      {/* Profile Information */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information and profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                {profilePicturePreview || profile?.profilePicture ? (
                  <img
                    src={profilePicturePreview || profile?.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-slate-400" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-hotel-gold text-white p-2 rounded-full cursor-pointer hover:bg-hotel-gold/80 transition-colors">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{profileData.displayName || 'Your Name'}</h3>
              <p className="text-slate-600">{profileData.email}</p>
              <Badge className="mt-2 capitalize">{profileData.role}</Badge>
            </div>
          </div>

          {profilePicture && (
            <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">Profile picture selected: {profilePicture.name}</span>
              <div className="flex gap-2 ml-auto">
                <Button
                  onClick={handleProfilePictureUpload}
                  disabled={loading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button
                  onClick={() => {
                    setProfilePicture(null);
                    setProfilePicturePreview(null);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
              <Input
                value={profileData.displayName}
                onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                placeholder="Your display name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <Input
                value={profileData.email}
                disabled
                className="bg-slate-50"
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <Input
                value={profileData.phoneNumber}
                onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                placeholder="Enter your phone number"
              />
              {profileData.nationality && countryCodes[profileData.nationality] && (
                <p className="text-xs text-slate-500 mt-1">
                  Country code: {countryCodes[profileData.nationality]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
              <Input
                type="date"
                value={profileData.dateOfBirth}
                onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Nationality</label>
              <Input
                value={profileData.nationality}
                onChange={(e) => setProfileData({...profileData, nationality: e.target.value})}
                placeholder="Your nationality"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleProfileUpdate} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password for better security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
            <Input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
            <Input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handlePasswordChange} disabled={loading}>
              <Lock className="h-4 w-4 mr-2" />
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600">
            Irreversible actions that will permanently affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-red-700">Delete Account</h4>
                <p className="text-sm text-red-600">Permanently delete your account and all associated data</p>
              </div>
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Are you absolutely sure?</h4>
                <p className="text-sm text-red-700 mb-4">
                  This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};