import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { VoiceInput, SmartVoiceInput } from "@/components/VoiceInput";
import { ArrowLeft, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const VoiceInputDemo = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleVoiceResult = (field, text) => {
    setFormData(prev => ({
      ...prev,
      [field]: text
    }));
  };

  const handleSmartVoiceData = (data) => {
    setFormData(data);
    toast.success("Form filled automatically from voice!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Form submitted successfully!");
    console.log("Form data:", formData);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold">🎤 Voice Input Demo</h1>
            <p className="text-muted-foreground mt-1">
              Fill forms using your voice - AI powered speech recognition
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Smart Voice Input - Auto-fill entire form */}
          <Card>
            <CardHeader>
              <CardTitle>✨ Smart Voice Input</CardTitle>
              <CardDescription>
                AI assistant will ask you questions and automatically fill the form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SmartVoiceInput onDataExtracted={handleSmartVoiceData} />
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold mb-2">How it works:</p>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Click "Start Voice Input" button</li>
                  <li>2. AI will ask "What is your name?"</li>
                  <li>3. Speak your answer clearly</li>
                  <li>4. AI continues with email, phone, and message</li>
                  <li>5. Form gets filled automatically!</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Manual Form with Voice Input per field */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Form with Voice Input</CardTitle>
              <CardDescription>
                Use the mic button next to each field to fill it with voice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => handleVoiceResult('name', e.target.value)}
                      className="flex-1"
                    />
                    <VoiceInput 
                      onResult={(text) => handleVoiceResult('name', text)}
                      placeholder="Name"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleVoiceResult('email', e.target.value)}
                      className="flex-1"
                    />
                    <VoiceInput 
                      onResult={(text) => {
                        // Smart email parsing
                        const email = text
                          .toLowerCase()
                          .replace(/\s+at\s+/g, '@')
                          .replace(/\s+dot\s+/g, '.')
                          .replace(/\s+/g, '');
                        handleVoiceResult('email', email);
                      }}
                      placeholder="Email"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Say "john at gmail dot com" for john@gmail.com
                  </p>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => handleVoiceResult('phone', e.target.value)}
                      className="flex-1"
                    />
                    <VoiceInput 
                      onResult={(text) => {
                        // Extract numbers only
                        const phone = text.replace(/\D/g, '');
                        handleVoiceResult('phone', phone);
                      }}
                      placeholder="Phone"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Speak digits clearly: "nine eight seven six..."
                  </p>
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <div className="flex gap-2 items-start">
                    <Textarea
                      id="message"
                      placeholder="Describe your issue or message"
                      value={formData.message}
                      onChange={(e) => handleVoiceResult('message', e.target.value)}
                      className="flex-1 min-h-32"
                    />
                    <VoiceInput 
                      onResult={(text) => handleVoiceResult('message', formData.message + ' ' + text)}
                      placeholder="Message"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Submit Form
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Input Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Browser Compatibility</h3>
                <p className="text-sm text-muted-foreground">
                  • Works best in Chrome, Edge, and Safari<br />
                  • Requires microphone permission<br />
                  • Must use HTTPS or localhost
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Speaking Tips</h3>
                <p className="text-sm text-muted-foreground">
                  • Speak clearly and at normal pace<br />
                  • For email: say "john at gmail dot com"<br />
                  • For phone: speak each digit separately<br />
                  • Minimize background noise
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <p className="text-sm text-muted-foreground">
                  • Real-time speech-to-text conversion<br />
                  • Smart parsing for emails and phone numbers<br />
                  • AI-guided form filling<br />
                  • Multi-language support (English optimized)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default VoiceInputDemo;
