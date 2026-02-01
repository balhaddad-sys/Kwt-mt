import { Linkedin, Instagram, GraduationCap, Building } from 'lucide-react';
import { Member } from '../../types';
import Card from '../ui/Card';

interface MemberCardProps {
  member: Member;
}

export default function MemberCard({ member }: MemberCardProps) {
  const fullName = `${member.firstName} ${member.lastName}`;

  return (
    <Card padding="none" className="group">
      <div className="flex flex-col sm:flex-row">
        {/* Photo */}
        <div className="sm:w-1/3 flex-shrink-0">
          <div className="aspect-square sm:h-full">
            {member.photoURL ? (
              <img
                src={member.photoURL}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {member.firstName.charAt(0)}
                  {member.lastName.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-5">
          <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-white group-hover:text-primary-500 dark:group-hover:text-accent-500 transition-colors">
            {fullName}
          </h3>

          {member.university && (
            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 mt-2">
              <Building className="w-4 h-4 mr-2 text-primary-500 dark:text-accent-500" />
              {member.university}
            </div>
          )}

          {member.major && (
            <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              <GraduationCap className="w-4 h-4 mr-2 text-primary-500 dark:text-accent-500" />
              {member.major}
              {member.graduationYear && ` • Class of ${member.graduationYear}`}
            </div>
          )}

          {member.bio && (
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-3 line-clamp-2">
              {member.bio}
            </p>
          )}

          {/* Social Links */}
          {member.socialLinks && (
            <div className="flex space-x-2 mt-4">
              {member.socialLinks.linkedin && (
                <a
                  href={member.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-primary-500 hover:text-white dark:hover:bg-accent-500 dark:hover:text-primary-900 transition-all"
                  aria-label={`${fullName}'s LinkedIn`}
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {member.socialLinks.instagram && (
                <a
                  href={member.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-primary-500 hover:text-white dark:hover:bg-accent-500 dark:hover:text-primary-900 transition-all"
                  aria-label={`${fullName}'s Instagram`}
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
