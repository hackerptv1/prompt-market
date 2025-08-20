import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableSectionProps {
  initialItems: number;
  items: React.ReactNode[];
  gridCols?: string;
  gap?: string;
  showAllText?: string;
}

export function ExpandableSection({ 
  initialItems, 
  items,
  gridCols = "grid-cols-1 md:grid-cols-2",
  gap = "gap-4",
  showAllText = "Show more"
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedItems = isExpanded ? items : items.slice(0, initialItems);

  return (
    <div className="space-y-4">
      <div className={`grid ${gridCols} ${gap}`}>
        {displayedItems}
      </div>
      
      {items.length > initialItems && (
        <div className="flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isExpanded ? (
              <>
                Show less
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                {showAllText}
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}