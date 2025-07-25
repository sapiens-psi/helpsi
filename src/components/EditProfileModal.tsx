import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditProfileModalProps {
  children?: React.ReactNode;
}

export const EditProfileModal = ({ children }: EditProfileModalProps) => {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    crp: profile?.crp || '',
    cpf_cnpj: profile?.cpf_cnpj || '',
    estado: profile?.estado || '',
    cidade: profile?.cidade || ''
  });
  
  const [isNotFromBrazil, setIsNotFromBrazil] = useState(false);
  
  const brazilianStates = [
    { value: 'AC', label: 'AC - Acre' },
    { value: 'AL', label: 'AL - Alagoas' },
    { value: 'AP', label: 'AP - Amapá' },
    { value: 'AM', label: 'AM - Amazonas' },
    { value: 'BA', label: 'BA - Bahia' },
    { value: 'CE', label: 'CE - Ceará' },
    { value: 'DF', label: 'DF - Distrito Federal' },
    { value: 'ES', label: 'ES - Espírito Santo' },
    { value: 'GO', label: 'GO - Goiás' },
    { value: 'MA', label: 'MA - Maranhão' },
    { value: 'MT', label: 'MT - Mato Grosso' },
    { value: 'MS', label: 'MS - Mato Grosso do Sul' },
    { value: 'MG', label: 'MG - Minas Gerais' },
    { value: 'PA', label: 'PA - Pará' },
    { value: 'PB', label: 'PB - Paraíba' },
    { value: 'PR', label: 'PR - Paraná' },
    { value: 'PE', label: 'PE - Pernambuco' },
    { value: 'PI', label: 'PI - Piauí' },
    { value: 'RJ', label: 'RJ - Rio de Janeiro' },
    { value: 'RN', label: 'RN - Rio Grande do Norte' },
    { value: 'RS', label: 'RS - Rio Grande do Sul' },
    { value: 'RO', label: 'RO - Rondônia' },
    { value: 'RR', label: 'RR - Roraima' },
    { value: 'SC', label: 'SC - Santa Catarina' },
    { value: 'SP', label: 'SP - São Paulo' },
    { value: 'SE', label: 'SE - Sergipe' },
    { value: 'TO', label: 'TO - Tocantins' }
  ];

  React.useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        crp: profile.crp || '',
        cpf_cnpj: profile.cpf_cnpj || '',
        estado: profile.estado || '',
        cidade: profile.cidade || ''
      });
      
      // Verifica se o estado não é um estado brasileiro E se há um estado cadastrado
      const isBrazilianState = brazilianStates.some(state => state.value === profile.estado);
      setIsNotFromBrazil(!isBrazilianState && profile.estado !== '' && profile.estado !== null);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile.mutateAsync(formData);
      setOpen(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Digite seu nome completo"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
              type="tel"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
            <Input
              id="cpf_cnpj"
              value={formData.cpf_cnpj}
              onChange={(e) => handleInputChange('cpf_cnpj', e.target.value)}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="not-from-brazil"
                checked={isNotFromBrazil}
                onCheckedChange={(checked) => {
                  setIsNotFromBrazil(checked as boolean);
                  if (checked) {
                    handleInputChange('estado', '');
                  }
                }}
              />
              <Label htmlFor="not-from-brazil" className="text-sm">
                Não sou do Brasil
              </Label>
            </div>
            
            {!isNotFromBrazil ? (
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => handleInputChange('estado', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {brazilianStates.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label htmlFor="estado">Estado/Província/Região</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  placeholder="Digite seu estado/província/região"
                />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={formData.cidade}
              onChange={(e) => handleInputChange('cidade', e.target.value)}
              placeholder="Ex: São Paulo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="crp">CRP (se aplicável)</Label>
            <Input
              id="crp"
              value={formData.crp}
              onChange={(e) => handleInputChange('crp', e.target.value)}
              placeholder="CRP 00/000000"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateProfile.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateProfile.isPending}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};