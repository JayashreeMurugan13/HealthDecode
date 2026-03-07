"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Calendar, 
  Droplets, 
  Ruler, 
  Weight, 
  Heart,
  Edit2,
  Check,
  X,
  Camera,
  Shield,
  Lock,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const avatars = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [healthScore, setHealthScore] = useState(100);
  
  // Calculate health score from reports
  useState(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      const userId = userData.id;
      const key = `reports_${userId}`;
      const reports = JSON.parse(localStorage.getItem(key) || '[]');
      
      if (reports.length > 0) {
        const abnormalFindings = reports.reduce((sum: number, r: any) => sum + (r.abnormalCount || 0), 0);
        const avgAbnormal = abnormalFindings / reports.length;
        const calculatedScore = Math.max(50, Math.round(100 - (avgAbnormal * 10)));
        setHealthScore(calculatedScore);
      } else {
        setHealthScore(100);
      }
    }
  });
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    age: user?.age?.toString() || "",
    dateOfBirth: user?.dateOfBirth || "",
    bloodGroup: user?.bloodGroup || "",
    height: user?.height?.toString() || "",
    weight: user?.weight?.toString() || "",
  });
  
  const handleSave = () => {
    updateProfile({
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : undefined,
      dateOfBirth: formData.dateOfBirth,
      bloodGroup: formData.bloodGroup,
      height: formData.height ? parseInt(formData.height) : undefined,
      weight: formData.weight ? parseInt(formData.weight) : undefined,
    });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      age: user?.age?.toString() || "",
      dateOfBirth: user?.dateOfBirth || "",
      bloodGroup: user?.bloodGroup || "",
      height: user?.height?.toString() || "",
      weight: user?.weight?.toString() || "",
    });
    setIsEditing(false);
  };
  
  const selectAvatar = (avatar: string) => {
    updateProfile({ profileImage: avatar });
    setShowAvatarPicker(false);
  };
  
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "#22C55E";
    if (score >= 60) return "#EAB308";
    return "#EF4444";
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and health profile
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          className="lg:col-span-2 p-6 rounded-2xl bg-white border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="rounded-lg"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="rounded-lg"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
          
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-[#0066FF]/10 flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-[#0066FF]" />
                )}
              </div>
              <button
                onClick={() => setShowAvatarPicker(true)}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#0066FF] flex items-center justify-center text-white shadow-lg hover:bg-[#0052CC] transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{user?.name || "Guest User"}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          
          {/* Avatar Picker Modal */}
          {showAvatarPicker && (
            <motion.div
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowAvatarPicker(false)}
            >
              <motion.div
                className="bg-white rounded-2xl p-6 max-w-md w-full"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Choose an Avatar</h3>
                <div className="grid grid-cols-3 gap-4">
                  {avatars.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => selectAvatar(avatar)}
                      className="w-full aspect-square rounded-xl bg-secondary p-2 hover:bg-[#0066FF]/10 transition-colors border-2 border-transparent hover:border-[#0066FF]"
                    >
                      <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full" />
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setShowAvatarPicker(false)}
                >
                  Cancel
                </Button>
              </motion.div>
            </motion.div>
          )}
          
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11 rounded-xl"
                />
              ) : (
                <p className="text-foreground font-medium py-2">{user?.name || "Not set"}</p>
              )}
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <p className="text-foreground font-medium py-2">{user?.email || "Not set"}</p>
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Age
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Enter your age"
                  className="h-11 rounded-xl"
                />
              ) : (
                <p className="text-foreground font-medium py-2">{user?.age || "Not set"}</p>
              )}
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date of Birth
              </Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="h-11 rounded-xl"
                />
              ) : (
                <p className="text-foreground font-medium py-2">{user?.dateOfBirth || "Not set"}</p>
              )}
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Blood Group
              </Label>
              {isEditing ? (
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3"
                >
                  <option value="">Select blood group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              ) : (
                <p className="text-foreground font-medium py-2">{user?.bloodGroup || "Not set"}</p>
              )}
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Height (cm)
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="Enter height in cm"
                  className="h-11 rounded-xl"
                />
              ) : (
                <p className="text-foreground font-medium py-2">
                  {user?.height ? `${user.height} cm` : "Not set"}
                </p>
              )}
            </div>
            
            <div>
              <Label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Weight className="w-4 h-4" />
                Weight (kg)
              </Label>
              {isEditing ? (
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="Enter weight in kg"
                  className="h-11 rounded-xl"
                />
              ) : (
                <p className="text-foreground font-medium py-2">
                  {user?.weight ? `${user.weight} kg` : "Not set"}
                </p>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Health Score Card */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-6 rounded-2xl bg-white border border-border">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-[#0066FF]" />
              <h2 className="text-lg font-semibold text-foreground">Health Score</h2>
            </div>
            
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="10"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke={getHealthScoreColor(healthScore)}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={352}
                    initial={{ strokeDashoffset: 352 }}
                    animate={{ strokeDashoffset: 352 - (352 * healthScore) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-3xl font-bold"
                    style={{ color: getHealthScoreColor(healthScore) }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    {healthScore}
                  </motion.span>
                  <span className="text-muted-foreground text-sm">/ 100</span>
                </div>
              </div>
            </div>
            
            <p className="text-center text-muted-foreground text-sm">
              {healthScore >= 80 
                ? "Excellent! Keep up the good work." 
                : healthScore >= 60 
                  ? "Good health. Room for improvement." 
                  : "Needs attention. Consult a doctor."}
            </p>
          </div>
          
          {/* Security Section */}
          <div className="p-6 rounded-2xl bg-white border border-border">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#0066FF]" />
              <h2 className="text-lg font-semibold text-foreground">Security</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">Data Encrypted</span>
                </div>
                <Check className="w-4 h-4 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">Secure Auth</span>
                </div>
                <Check className="w-4 h-4 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">Privacy Protected</span>
                </div>
                <Check className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
