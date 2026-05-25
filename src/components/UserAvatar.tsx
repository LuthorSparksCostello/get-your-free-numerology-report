interface UserAvatarProps {
  picture?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Displays Auth0 user profile picture with fallback initials.
 */
const UserAvatar = ({ picture, name, size = 'md' }: UserAvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border border-amber-500/20`}
      style={{
        background: picture
          ? 'transparent'
          : 'linear-gradient(135deg, rgba(222, 174, 82, 0.2), rgba(139, 92, 246, 0.2))',
      }}
    >
      {picture ? (
        <img
          src={picture}
          alt={name || 'User avatar'}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="text-amber-400 font-semibold">{initials}</span>
      )}
    </div>
  );
};

export default UserAvatar;
