import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchEmergencyCard, saveEmergencyCard } from '@/store/slices/emergencyCardSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function EmergencyCard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { card } = useAppSelector((state) => state.emergencyCard);
  const [formData, setFormData] = useState({ fullName: '', bloodType: '', allergies: '', medications: '', emergencyContact: '', medicalConditions: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(fetchEmergencyCard()); }, [dispatch]);
  useEffect(() => { if (card) setFormData({ fullName: card.fullName, bloodType: card.bloodType, allergies: card.allergies, medications: card.medications, emergencyContact: card.emergencyContact, medicalConditions: card.medicalConditions }); }, [card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(saveEmergencyCard(formData)).unwrap();
      toast.success('Emergency card saved!');
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b"><div className="container mx-auto px-4 py-4 flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-5 w-5" /></Button><h1 className="text-2xl font-bold text-primary">Emergency Card</h1></div></header>
      <main className="container mx-auto px-4 py-8 max-w-4xl"><div className="grid gap-6 md:grid-cols-2"><Card><CardHeader><CardTitle>Emergency Information</CardTitle></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-4"><div className="space-y-2"><Label>Full Name</Label><Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required /></div><div className="space-y-2"><Label>Blood Type</Label><Input placeholder="e.g., A+" value={formData.bloodType} onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })} required /></div><div className="space-y-2"><Label>Allergies</Label><Textarea value={formData.allergies} onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} /></div><div className="space-y-2"><Label>Medications</Label><Textarea value={formData.medications} onChange={(e) => setFormData({ ...formData, medications: e.target.value })} /></div><div className="space-y-2"><Label>Emergency Contact</Label><Input value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} required /></div><div className="space-y-2"><Label>Medical Conditions</Label><Textarea value={formData.medicalConditions} onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })} /></div><Button type="submit" className="w-full" disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save'}</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Your QR Code</CardTitle></CardHeader><CardContent className="flex flex-col items-center space-y-4">{card?.qrCode ? <><img src={card.qrCode} alt="QR" className="w-64 h-64" /><Button onClick={() => { const link = document.createElement('a'); link.href = card.qrCode!; link.download = 'qr.png'; link.click(); }} variant="outline" className="w-full"><Download className="mr-2 h-4 w-4" />Download</Button></> : <p className="text-muted-foreground">Save to generate QR</p>}</CardContent></Card></div></main>
    </div>
  );
}
