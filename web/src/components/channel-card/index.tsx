import React from "react";
import { type IconName, icons } from "@/components/icons";

interface ChannelCardProps {
  imageSrc?: string;
  title: string;
  description: string;
  iconName: IconName;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  imageSrc,
  title,
  description,
  iconName,
}) => {
  const Icon = icons[iconName];

  return (
    <div className="w-64 h-64 rounded-2xl overflow-hidden bg-white border border-neutral/50 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="h-3/5 bg-neutral flex items-center justify-center">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-secondary/50 text-body">Image Placeholder</span>
        )}
      </div>

      <div className="h-2/5 bg-primary p-5 flex flex-col justify-center rounded-b-2xl">
        <div className="flex items-center gap-2 mb-1">
          {Icon && <Icon className="w-5 h-5 text-accent" />}
          <h3 className="text-subheader text-[#F7F7F7] font-semibold">
            {title}
          </h3>
        </div>
        <p className="text-body text-[#F7F7F7]/80">{description}</p>
      </div>
    </div>
  );
};

export default ChannelCard;
