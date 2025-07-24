import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Search } from 'lucide-react';
import { useSpecialistPDFs } from '@/hooks/useSpecialistPDFs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SpecialistPDFs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: pdfs = [], isLoading } = useSpecialistPDFs();

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

  const handleView = (url: string) => {
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">PDFs Explicativos</h1>
        <p className="text-muted-foreground">
          Acesse e visualize os materiais explicativos disponíveis
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
                  : 'Não há PDFs disponíveis no momento.'
                }
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
                  <Badge variant="outline">
                    {pdf.category || 'Geral'}
                  </Badge>
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
                        onClick={() => handleView(pdf.url)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
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
    </div>
  );
};

export default SpecialistPDFs;