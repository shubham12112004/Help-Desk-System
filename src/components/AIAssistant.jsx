import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  generateTicketSummary,
  generateReplySuggestions,
  analyzeSentiment,
} from "@/services/openai";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export function AIAssistant({ ticket, onSuggestedReplySelect }) {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isSourcing, setIsSourcing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [suggestedReplies, setSuggestedReplies] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const generatedSummary = await generateTicketSummary(
        ticket.title,
        ticket.description,
        ticket.category
      );
      setSummary(generatedSummary);
      toast.success("Summary generated successfully");
    } catch (error) {
      toast.error("Failed to generate summary");
      console.error(error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const generateReplies = async () => {
    setIsGeneratingReply(true);
    try {
      const replies = await generateReplySuggestions(
        ticket.title,
        ticket.description,
        ticket.category,
        [] // conversation history can be added here
      );

      // Parse replies (they come as a numbered list)
      const parsedReplies = replies
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => line.replace(/^\d+\.\s*/, ""))
        .filter((line) => line.length > 0);

      setSuggestedReplies(parsedReplies);
      toast.success("Reply suggestions generated");
    } catch (error) {
      toast.error("Failed to generate reply suggestions");
      console.error(error);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const analyzeSentimentOfTicket = async () => {
    setIsSourcing(true);
    try {
      const analysis = await analyzeSentiment(ticket.description);
      setSentiment(analysis);
      toast.success("Sentiment analysis complete");
    } catch (error) {
      toast.error("Failed to analyze sentiment");
      console.error(error);
    } finally {
      setIsSourcing(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Summary Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            AI Summary
          </CardTitle>
          <CardDescription className="text-xs">
            Auto-generated ticket overview using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="space-y-3">
              <p className="text-sm text-foreground bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 border-l-4 border-l-yellow-600">
                {summary}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSummary(null);
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(summary, -1)}
                  className="ml-auto"
                >
                  {copiedIndex === -1 ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={generateSummary}
              disabled={isGeneratingSummary}
              className="w-full gap-2"
              variant="outline"
            >
              {isGeneratingSummary ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Summary
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Sentiment Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Sentiment Analysis
          </CardTitle>
          <CardDescription className="text-xs">
            Analyze customer sentiment in this ticket
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sentiment ? (
            <div className="space-y-3">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-foreground">{sentiment}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSentiment(null)}
              >
                Clear
              </Button>
            </div>
          ) : (
            <Button
              onClick={analyzeSentimentOfTicket}
              disabled={isSourcing}
              className="w-full gap-2"
              variant="outline"
            >
              {isSourcing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze Sentiment
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Suggested Replies */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-green-600" />
            Suggested Replies
          </CardTitle>
          <CardDescription className="text-xs">
            AI-powered response suggestions for quick replies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suggestedReplies.length > 0 ? (
            <div className="space-y-2">
              {suggestedReplies.map((reply, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{reply}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(reply, index)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedIndex === index ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSuggestedReplySelect(reply)}
                      className="h-8 px-2"
                    >
                      Use
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSuggestedReplies([])}
                className="w-full"
              >
                Clear
              </Button>
            </div>
          ) : (
            <Button
              onClick={generateReplies}
              disabled={isGeneratingReply}
              className="w-full gap-2"
              variant="outline"
            >
              {isGeneratingReply ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Replies
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
