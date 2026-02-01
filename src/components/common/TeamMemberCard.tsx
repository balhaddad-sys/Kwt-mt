import { Linkedin, Twitter, Instagram, Mail } from 'lucide-react';
import { TeamMember } from '../../types';
import Card from '../ui/Card';

interface TeamMemberCardProps {
  member: TeamMember;
}

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <Card padding="none" className="group text-center">
      <div className="relative overflow-hidden">
        <div className="aspect-square">
          {member.photoURL ? (
            <img
              src={member.photoURL}
              alt={member.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-5xl font-bold text-white">
                {member.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-primary-500/90 dark:bg-neutral-800/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="flex space-x-3">
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-accent-500 hover:text-primary-900 transition-all"
                aria-label={`Email ${member.name}`}
              >
                <Mail className="w-5 h-5" />
              </a>
            )}
            {member.socialLinks?.linkedin && (
              <a
                href={member.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-accent-500 hover:text-primary-900 transition-all"
                aria-label={`${member.name}'s LinkedIn`}
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {member.socialLinks?.twitter && (
              <a
                href={member.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-accent-500 hover:text-primary-900 transition-all"
                aria-label={`${member.name}'s Twitter`}
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {member.socialLinks?.instagram && (
              <a
                href={member.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-accent-500 hover:text-primary-900 transition-all"
                aria-label={`${member.name}'s Instagram`}
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-white">
          {member.name}
        </h3>
        <p className="text-accent-500 font-medium text-sm mt-1">
          {member.position}
        </p>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-3 line-clamp-3">
          {member.bio}
        </p>
      </div>
    </Card>
  );
}
