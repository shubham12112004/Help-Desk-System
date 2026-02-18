/**
 * AI Assistant Component
 * Provides AI-powered suggestions for tickets
 */

import { useState } from 'react';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

export function AISuggestions({ suggestions, loading, type = 'reply' }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">AI Suggestions</CardTitle>
        </div>
        <CardDescription className="text-xs">
          {type === 'reply' ? 'Suggested responses' : 'AI-powered recommendations'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="group relative p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm text-foreground pr-8">{suggestion}</p>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy(suggestion, index)}
              >
                {copiedIndex === index ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function AIPriorityBadge({ priority, confidence }) {
  const priorityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    urgent: 'bg-orange-100 text-orange-800 border-orange-200',
    high: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={cn("text-xs", priorityColors[priority] || priorityColors.medium)}>
        <Sparkles className="h-3 w-3 mr-1" />
        AI: {priority}
      </Badge>
      {confidence && (
        <span className="text-xs text-muted-foreground">
          {Math.round(confidence * 100)}% confidence
        </span>
      )}
    </div>
  );
}

export function AIDepartmentSuggestion({ department, onAccept }) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Suggested Department</p>
              <p className="text-xs text-muted-foreground capitalize">{department}</p>
            </div>
          </div>
          {onAccept && (
            <Button size="sm" variant="outline" onClick={() => onAccept(department)}>
              Use
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AISuggestions;
