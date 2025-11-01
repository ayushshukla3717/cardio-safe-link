import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function EmergencyCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [formData, setFormData] = useState({
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    blood_type: '',
    allergies: [] as string[],
    medications: [] as string[],
    conditions: [] as string[]
  });

  useEffect(() => {
    fetchCard();
  }, [user]);

  const fetchCard = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('emergency_cards')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setCard(data);
      setFormData({
        emergency_contact_name: data.emergency_contact_name || '',
        emergency_contact_phone: data.emergency_contact_phone || '',
        emergency_contact_relationship: data.emergency_contact_relationship || '',
        blood_type: data.blood_type || '',
        allergies: data.allergies || [],
        medications: data.medications || [],
        conditions: data.conditions || []
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: { cardData: formData }
      });

      if (error) throw error;

      toast.success('Emergency card saved successfully!');
      setCard(data.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save emergency card');
    } finally {
      setSaving(false);
    }
  };

  const handleArrayInput = (field: 'allergies' | 'medications' | 'conditions', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(Boolean)
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Emergency Card</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Emergency Medical Card</h2>
          <p className="text-muted-foreground">Create your emergency card with a QR code for quick access</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card Information</CardTitle>
              <CardDescription>Fill in your emergency medical information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Emergency Contact Name</Label>
                  <Input
                    id="contact-name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Emergency Contact Phone</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={formData.emergency_contact_relationship}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                    placeholder="e.g., Spouse, Parent, Friend"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood-type">Blood Type</Label>
                  <Select value={formData.blood_type} onValueChange={(value) => setFormData({ ...formData, blood_type: value })}>
                    <SelectTrigger id="blood-type">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies.join(', ')}
                    onChange={(e) => handleArrayInput('allergies', e.target.value)}
                    placeholder="e.g., Penicillin, Peanuts"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medications">Current Medications (comma-separated)</Label>
                  <Input
                    id="medications"
                    value={formData.medications.join(', ')}
                    onChange={(e) => handleArrayInput('medications', e.target.value)}
                    placeholder="e.g., Aspirin, Insulin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conditions">Medical Conditions (comma-separated)</Label>
                  <Input
                    id="conditions"
                    value={formData.conditions.join(', ')}
                    onChange={(e) => handleArrayInput('conditions', e.target.value)}
                    placeholder="e.g., Diabetes, Hypertension"
                  />
                </div>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? 'Saving...' : 'Generate Emergency Card'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {card && (
            <Card>
              <CardHeader>
                <CardTitle>Your Emergency QR Code</CardTitle>
                <CardDescription>Scan this code to access emergency information</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <img src={card.qr_code} alt="Emergency QR Code" className="w-64 h-64" />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Save this QR code on your phone or print it out. Emergency responders can scan it to access your medical information.
                </p>
                <Button variant="outline" asChild className="w-full">
                  <a href={card.qr_code} download="emergency-qr-code.png">
                    Download QR Code
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {!card && !loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <QrCode className="h-24 w-24 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Fill in your emergency information and click "Generate Emergency Card" to create your QR code
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}