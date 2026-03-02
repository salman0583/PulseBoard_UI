import { useState } from 'react';
import { User as UserIcon, Mail, Phone, Building, Key, Bell, Shield, ChevronRight } from 'lucide-react';
import { User } from '../App';

type SettingsPageProps = {
  user: User;
};

export function SettingsPage({ user }: SettingsPageProps) {
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    email: user.email,
    phone: '',
    organization: ''
  });

  const [notifications, setNotifications] = useState({
    mentions: true,
    direct_messages: true,
    task_updates: true,
    workspace_updates: false,
    email_notifications: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving settings:', formData);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Settings</h1>
          <p className="text-gray-500 text-lg">Manage your personal profile and account preferences</p>
        </div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Profile Information</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-100">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">@{user.username}</h4>
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors"
                  >
                    Update profile picture
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="full-name" className="text-sm font-bold text-gray-700">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="full-name"
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-bold text-gray-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Organization */}
                <div className="space-y-2">
                  <label htmlFor="organization" className="text-sm font-bold text-gray-700">Organization</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="organization"
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                      placeholder="Your company"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Notification Settings */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-200 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              </div>
              <div className="p-6 divide-y divide-gray-100">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Via email and push notifications
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-column">
              <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-200 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Security</h3>
              </div>
              <div className="p-6 space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                  <div className="text-left">
                    <p className="font-bold text-sm text-gray-900">Password</p>
                    <p className="text-xs text-gray-500">Last changed 2 months ago</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </button>

                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <p className="font-bold text-sm text-indigo-900 mb-1">2FA is disabled</p>
                  <p className="text-xs text-indigo-700 mb-3">Add an extra layer of security to your account.</p>
                  <button className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-8 flex items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-1">Delete your account</h3>
              <p className="text-red-700 text-sm">Once you delete your account, there is no going back. Please be certain.</p>
            </div>
            <button className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 hover:shadow-lg hover:shadow-red-100 transition-all flex-shrink-0">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
