import React from 'react';

const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = () => {
    if (!password) return { level: 0, text: '', color: 'bg-gray-200' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { level: 1, text: 'Weak', color: 'bg-red-500' };
    if (strength <= 4) return { level: 2, text: 'Fair', color: 'bg-orange-500' };
    if (strength <= 5) return { level: 3, text: 'Good', color: 'bg-amber-500' };
    return { level: 4, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getStrength();
  const width = (strength.level / 4) * 100;

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`h-1 flex-1 rounded-full transition-all ${
              bar <= strength.level ? strength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        Password strength: <span className="font-semibold">{strength.text}</span>
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;