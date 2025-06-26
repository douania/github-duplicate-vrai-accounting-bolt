import React, { useState, useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileSpreadsheet,
  FileText,
  Building2,
  X,
  AlertTriangle,
  CheckCircle,
  FileUp,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { fileProcessingService } from '@/services/fileProcessingService';
import { progressService } from '@/services/progressService';
import { ProgressDisplay } from '@/components/ProgressDisplay';
import ProcessingResultsDetailed from '@/components/ProcessingResultsDetailed';

const FileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileTypes, setFileTypes] = useState<{ [key: string]: string }>({});
  const [processing, setProcessing] = useState(false);
  const [processingResults, setProcessingResults] = useState<any>(null);
  const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([]);

  const onDrop = useCallback((acceptedFiles: File[], rejected: FileRejection[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles]);

    const newTypes: { [key: string]: string } = {};
    acceptedFiles.forEach(file => {
      const name = file.name.toUpperCase();
      if (name.includes('COLLECTION')) newTypes[file.name] = 'Collection Report';
      else if (name.includes('FUND')) newTypes[file.name] = 'Fund Position';
      else if (name.includes('CLIENT') && name.includes('RECON')) newTypes[file.name] = 'Client Reconciliation';
      else newTypes[file.name] = 'Autre Document';
    });
    setFileTypes(prev => ({ ...prev, ...newTypes }));

    if (rejected.length > 0) {
      setRejectedFiles(rejected);
      toast.error(`${rejected.length} fichier(s) non accepté(s).`);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  });

  const handleSubmit = async () => {
    setProcessing(true);
    setProcessingResults(null);
    progressService.reset();

    try {
      const result = await fileProcessingService.processFiles(selectedFiles);
      if (result.success) {
        toast.success('Fichiers traités avec succès.');
        setProcessingResults(result);
      } else {
        toast.error(`Erreur: ${result.errors?.join(', ') || 'Erreur inconnue'}`);
      }
    } catch (error: any) {
      toast.error(`Erreur critique: ${error?.message || 'Erreur inconnue'}`);
    } finally {
      setProcessing(false);
    }
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
    setFileTypes(prev => {
      const copy = { ...prev };
      delete copy[fileName];
      return copy;
    });
  };

  const clearRejectedFiles = () => setRejectedFiles([]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Importation des Données</h1>
          <p className="text-gray-600 mt-2">
            Déposez tous vos fichiers en une seule fois. Le système les identifiera et les traitera automatiquement.
          </p>
        </div>
        <Badge className="text-lg px-4 py-2 bg-blue-100 text-blue-800">Importation Intelligente</Badge>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center w-full h-48 bg-blue-50 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
              <FileUp className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Déposez tous vos fichiers ici</h3>
              <p className="text-blue-600 text-center max-w-md">
                Glissez-déposez tous vos fichiers Excel et PDF en une seule fois.
              </p>
              <p className="text-sm text-blue-500 mt-2">Formats acceptés: .xlsx, .xls, .csv, .pdf</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <div className="flex justify-center my-8 sticky bottom-4">
          <Button
            onClick={handleSubmit}
            disabled={processing}
            size="lg"
            className="px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg"
          >
            {processing ? 'Traitement en cours...' : (
              <>
                Traiter {selectedFiles.length} fichier(s)
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      )}

      {rejectedFiles.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex justify-between items-center">
              <span>{rejectedFiles.length} fichier(s) non accepté(s)</span>
              <Button variant="outline" size="sm" onClick={clearRejectedFiles}>
                Effacer
              </Button>
            </div>
            <div className="mt-2 space-y-1">
              {rejectedFiles.map((rejection, index) => (
                <div key={index} className="text-sm">
                  {rejection.file.name} – {rejection.errors.map(e => e.message).join(', ')}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {processingResults && <ProcessingResultsDetailed results={processingResults} />}

      {selectedFiles.length > 0 && (
        <Card className="mb-8">
          <CardContent>
            <div className="space-y-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium truncate max-w-md">{file.name}</div>
                      <div className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="px-3 py-1 bg-gray-100 text-gray-800">
                      {fileTypes[file.name] || 'Autre Document'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.name)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUpload;
