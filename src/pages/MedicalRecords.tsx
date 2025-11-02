import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMedicalRecords, uploadMedicalRecord, deleteMedicalRecord } from '@/store/slices/medicalRecordsSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, Trash2, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { QRScanner } from '@/components/QRScanner';

export default function MedicalRecords() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { records, loading } = useAppSelector((state) => state.medicalRecords);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    dispatch(fetchMedicalRecords());
  }, [dispatch]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      toast.error('Please provide both file and title');
      return;
    }
    setUploading(true);
    try {
      await dispatch(uploadMedicalRecord({ file, title })).unwrap();
      toast.success('Medical record uploaded successfully!');
      setFile(null);
      setTitle('');
    } catch (err) {
      toast.error('Failed to upload medical record');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteMedicalRecord(id)).unwrap();
      toast.success('Medical record deleted');
    } catch (err) {
      toast.error('Failed to delete medical record');
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    toast.success('QR Code scanned!');
    console.log('Scanned data:', decodedText);
    setShowScanner(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Medical Records</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {showScanner ? (
          <QRScanner onScanSuccess={handleScanSuccess} onClose={() => setShowScanner(false)} />
        ) : (
          <>
            <Card className="mb-8">
              <CardHeader><CardTitle>Upload New Record</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Record Title</Label>
                    <Input id="title" placeholder="e.g., Blood Test Results" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">File (PDF or Image)</Label>
                    <Input id="file" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={uploading} className="flex-1"><Upload className="mr-2 h-4 w-4" />{uploading ? 'Uploading...' : 'Upload Record'}</Button>
                    <Button type="button" variant="outline" onClick={() => setShowScanner(true)}><QrCode className="mr-2 h-4 w-4" />Scan QR</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Records</h2>
              {loading ? <p className="text-muted-foreground">Loading...</p> : records.length === 0 ? <p className="text-muted-foreground">No medical records yet. Upload your first one above!</p> : records.map((record) => (
                <Card key={record.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div><h3 className="font-semibold">{record.title}</h3><p className="text-sm text-muted-foreground">Uploaded: {new Date(record.uploadedAt).toLocaleDateString()}</p></div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => window.open(record.fileUrl, '_blank')}>View</Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(record.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
