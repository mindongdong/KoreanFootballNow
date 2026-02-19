import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RotateCcw } from 'lucide-react';
import { translateLeague, translatePosition } from '@/utils/translations';

interface FilterPanelProps {
  leagues: string[];
  positions: string[];
  selectedLeagues: string[];
  selectedPosition: string;
  injuredOnly: boolean;
  onLeagueChange: (leagues: string[]) => void;
  onPositionChange: (position: string) => void;
  onInjuredToggle: (checked: boolean) => void;
  onResetFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  leagues,
  positions,
  selectedLeagues,
  selectedPosition,
  injuredOnly,
  onLeagueChange,
  onPositionChange,
  onInjuredToggle,
  onResetFilters,
}) => {
  const handleLeagueToggle = (league: string, checked: boolean) => {
    if (checked) {
      onLeagueChange([...selectedLeagues, league]);
    } else {
      onLeagueChange(selectedLeagues.filter((l) => l !== league));
    }
  };

  const hasActiveFilters = selectedLeagues.length > 0 || selectedPosition !== '' || injuredOnly;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">필터</h3>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onResetFilters} className="gap-2 rounded-full">
            <RotateCcw className="h-3.5 w-3.5" />
            초기화
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <Accordion type="single" collapsible className="rounded-xl border bg-white">
          <AccordionItem value="leagues" className="border-none">
            <AccordionTrigger className="px-5 py-3.5 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">리그</span>
                {selectedLeagues.length > 0 && (
                  <span className="px-2 py-0.5 bg-kfn-red/10 text-kfn-red text-xs font-bold rounded-full">
                    {selectedLeagues.length}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {leagues.map((league) => (
                  <div key={league} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id={`league-${league}`}
                      checked={selectedLeagues.includes(league)}
                      onCheckedChange={(checked) => handleLeagueToggle(league, checked as boolean)}
                    />
                    <label htmlFor={`league-${league}`} className="text-sm font-medium cursor-pointer flex-1">
                      {translateLeague(league)}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion type="single" collapsible className="rounded-xl border bg-white">
          <AccordionItem value="positions" className="border-none">
            <AccordionTrigger className="px-5 py-3.5 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">포지션</span>
                {selectedPosition && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                    {translatePosition(selectedPosition)}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4">
              <RadioGroup value={selectedPosition} onValueChange={onPositionChange} className="space-y-2">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="" id="position-all" />
                  <Label htmlFor="position-all" className="cursor-pointer flex-1">전체 포지션</Label>
                </div>
                {positions.map((position) => (
                  <div key={position} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value={position} id={`position-${position}`} />
                    <Label htmlFor={`position-${position}`} className="cursor-pointer flex-1">
                      {translatePosition(position)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex items-center justify-between rounded-xl border bg-white p-5">
          <Label htmlFor="injured-only" className="text-sm font-bold cursor-pointer">
            부상 선수만 보기
          </Label>
          <Switch id="injured-only" checked={injuredOnly} onCheckedChange={onInjuredToggle} />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
