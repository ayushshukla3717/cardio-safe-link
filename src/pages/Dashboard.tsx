import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Heart, MessageSquare, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Digital Health Passport</h1>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Manage your health information securely</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/records')}>
            <CardHeader>
              <FileText className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>Upload and manage your medical documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Records</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/emergency-card')}>
            <CardHeader>
              <Heart className="h-12 w-12 text-destructive mb-4" />
              <CardTitle>Emergency Card</CardTitle>
              <CardDescription>Create your emergency medical card with QR code</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Card</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/chatbot')}>
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-accent mb-4" />
              <CardTitle>Health Assistant</CardTitle>
              <CardDescription>Chat with AI for health information</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Chat</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}