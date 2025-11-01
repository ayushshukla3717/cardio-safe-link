import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Upload, FileText, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function MedicalRecords() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch records');
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;

    if (!file) {
      toast.error('Please select a file');
      setUploading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('upload-medical-record', {
        body: formData
      });

      if (error) throw error;

      toast.success('Record uploaded successfully!');
      setOpen(false);
      fetchRecords();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload record');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, cloudinaryId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      // Delete from storage
      await supabase.storage.from('medical-records').remove([cloudinaryId]);

      // Delete from database
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Record deleted successfully');
      fetchRecords();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete record');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Medical Records</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Your Medical Records</h2>
            <p className="text-muted-foreground">Upload and manage your medical documents securely</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Medical Record</DialogTitle>
                <DialogDescription>Upload your medical document securely</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input id="file" name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                </div>
                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No records yet</p>
              <p className="text-sm text-muted-foreground mb-4">Upload your first medical record to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {records.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{record.title}</CardTitle>
                      {record.description && <CardDescription>{record.description}</CardDescription>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(record.id, record.cloudinary_id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Uploaded: {new Date(record.created_at).toLocaleDateString()}
                    </div>
                    <Button variant="outline" asChild>
                      <a href={record.file_url} target="_blank" rel="noopener noreferrer">
                        View File
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}