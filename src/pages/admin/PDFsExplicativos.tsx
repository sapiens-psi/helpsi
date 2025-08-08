import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Eye, Search, Upload, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface PDF {
  id: string;
  name: string;
  description?: string;
  url: string;
  category: string;
  created_at: string;
}

const PDFsExplicativos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Estado do formulário de upload
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: '',
    file: null as File | null
  });

  // Dados mockados - substituir por hook real quando implementar backend
  const [pdfs, setPdfs] = useState<PDF[]>([
    {
      id: '1',
      name: 'Manual de Atendimento.pdf',
      description: 'Guia completo para atendimento ao cliente',
      url: '/pdfs/manual-atendimento.pdf',
      category: 'Treinamento',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Protocolo Pré-Venda.pdf',
      description: 'Procedimentos para atendimento pré-venda',
      url: '/pdfs/protocolo-pre-venda.pdf',
      category: 'Pré-venda',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Protocolo Pós-Venda.pdf',
      description: 'Procedimentos para atendimento pós-venda',
      url: '/pdfs/protocolo-pos-venda.pdf',
      category: 'Pós-venda',
      created_at: new Date().toISOString(),
    },
  ]);

  const filteredPDFs = pdfs.filter(pdf =>
    pdf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdf.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
  };

  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    setIsPreviewOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Por favor, selecione apenas arquivos PDF');
        return;
      }
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.name || !uploadForm.category || !uploadForm.file) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      // Simular upload - substituir por implementação real
      const newPDF: PDF = {
        id: Date.now().toString(),
        name: uploadForm.name,
        description: '',
        url: URL.createObjectURL(uploadForm.file),
        category: uploadForm.category,
        created_at: new Date().toISOString(),
      };

      setPdfs(prev => [newPDF, ...prev]);
      setUploadForm({ name: '', category: '', file: null });
      setIsUploadDialogOpen(false);
      toast.success('PDF adicionado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer upload do PDF');
    }
  };

  const handleDelete = (id: string) => {
    setPdfs(prev => prev.filter(pdf => pdf.id !== id));
    toast.success('PDF removido com sucesso!');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">PDFs Explicativos</h1>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar PDF
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo PDF</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do PDF</Label>
                  <Input
                    id="name"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Manual de Atendimento"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Situação/Categoria</Label>
                  <Select
                    value={uploadForm.category}
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Treinamento">Treinamento</SelectItem>
                      <SelectItem value="Pré-venda">Pré-venda</SelectItem>
                      <SelectItem value="Pós-venda">Pós-venda</SelectItem>
                      <SelectItem value="Geral">Geral</SelectItem>
                      <SelectItem value="Procedimentos">Procedimentos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="file">Arquivo PDF</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {uploadForm.file && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Arquivo selecionado: {uploadForm.file.name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpload} className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Fazer Upload
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">
          Gerencie os PDFs explicativos disponíveis para os especialistas
        </p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar PDFs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPDFs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? 'Nenhum PDF encontrado para esta busca.'
                  : 'Não há PDFs disponíveis no momento.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPDFs.map((pdf) => (
            <Card key={pdf.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {pdf.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {pdf.category || 'Geral'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(pdf.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pdf.description && (
                    <p className="text-sm text-muted-foreground">
                      {pdf.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Adicionado em: {format(new Date(pdf.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(pdf.url)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(pdf.url, pdf.name)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview do PDF</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="w-full h-[70vh] border rounded"
                title="PDF Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDFsExplicativos;