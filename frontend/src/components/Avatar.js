import React from 'react';

const Avatar = ({ name, size = 'md', className = '' }) => {
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getColorFromName = (name) => {
    if (!name) return 'bg-gray-500';
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-violet-500'
    ];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-20 w-20 text-2xl'
  };

  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <div
      className={`${sizes[size]} ${bgColor} ${className} rounded-full flex items-center justify-center text-white font-bold shadow-md transition-transform hover:scale-110`}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
