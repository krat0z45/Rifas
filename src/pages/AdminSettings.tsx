import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useForm, useFieldArray } from 'react-hook-form';
import { Trash, Plus, AlertCircle, Edit } from 'lucide-react';

export default function AdminSettings() {
  const { register, handleSubmit, reset, control } = useForm();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "bankAccounts"
  });
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<any[]>([]);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'about' | 'admins'>('general');
  const [adminToDelete, setAdminToDelete] = useState<{id: number, email: string} | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [adminToEdit, setAdminToEdit] = useState<{id: number, name: string, email: string} | null>(null);
  const [editAdminName, setEditAdminName] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
  const [editAdminPassword, setEditAdminPassword] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsData, usersData] = await Promise.all([
          api.getSettings(),
          api.getUsers()
        ]);
        if (settingsData) {
          try {
            settingsData.bankAccounts = JSON.parse(settingsData.bankInfo);
            if (!Array.isArray(settingsData.bankAccounts)) settingsData.bankAccounts = [];
          } catch(e) {
            settingsData.bankAccounts = [];
          }
          reset(settingsData);
        }
        if (usersData) {
          setAdmins(usersData);
        }
        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [reset]);

  const onSubmit = async (data: any) => {
    try {
      const payload = { ...data };
      payload.bankInfo = JSON.stringify(data.bankAccounts || []);
      delete payload.bankAccounts;
      await api.updateSettings(payload);
      alert('Configuración guardada!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail || !newAdminPassword) return;
    try {
      const newAdmin = await api.createUser({ name: newAdminName, email: newAdminEmail, password: newAdminPassword });
      setAdmins([...admins, newAdmin]);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
    } catch (error) {
      console.error(error);
      alert('Error creando admin');
    }
  };

  const handleDeleteAdminClick = (admin: any) => {
    if (admins.length <= 1) {
      alert("No puedes eliminar la cuenta de administrador. Debe existir al menos 1 cuenta.");
      return;
    }
    setAdminToDelete({ id: admin.id, email: admin.email });
    setDeleteError('');
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;
    try {
      await api.deleteUser(adminToDelete.id.toString());
      setAdmins(admins.filter(a => a.id !== adminToDelete.id));
      setAdminToDelete(null);
    } catch (error: any) {
      console.error(error);
      setDeleteError(error.message || 'Hubo un error al eliminar el administrador.');
    }
  };

  const handleEditAdminClick = (admin: any) => {
    setAdminToEdit({ id: admin.id, name: admin.name || '', email: admin.email });
    setEditAdminName(admin.name || '');
    setEditAdminEmail(admin.email);
    setEditAdminPassword('');
    setEditError('');
  };

  const confirmEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToEdit) return;
    if (!editAdminName || !editAdminEmail) return;
    try {
      const updateData: any = { name: editAdminName, email: editAdminEmail };
      if (editAdminPassword) {
        updateData.password = editAdminPassword;
      }
      const updatedAdmin = await api.updateUser(adminToEdit.id.toString(), updateData);
      setAdmins(admins.map(a => a.id === updatedAdmin.id ? updatedAdmin : a));
      setAdminToEdit(null);
    } catch (error: any) {
      console.error(error);
      setEditError(error.message || 'Hubo un error al editar el administrador.');
    }
  };

  if (loading) return <div className="text-slate-400">Cargando configuraciones...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">Configuración</h2>
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button 
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'general' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            General
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'about' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Quiénes Somos
          </button>
          <button 
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'admins' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Admins
          </button>
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className={activeTab === 'general' ? 'block' : 'hidden'}>
            <h3 className="text-xl font-bold text-white mb-6">Ajustes Generales del Sistema</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-400">Nombre del Sistema</Label>
                <input 
                  {...register('systemName')} 
                  placeholder="Ej. RifasPremium" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400">Número de WhatsApp (Admin)</Label>
                <input 
                  {...register('adminWhatsApp')} 
                  placeholder="Ej. 5211234567890" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
                />
                <p className="text-xs text-slate-500">Número al cual enviarán el comprobante y el folio (incluye código de país, sin '+' ni espacios).</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-400">Información Bancaria (Cuentas para Depósitos/Transferencias)</Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={() => append({ bankName: '', accountNumber: '', beneficiary: '' })}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Cuenta
                  </Button>
                </div>
                
                {fields.length === 0 && (
                  <div className="p-6 border border-dashed border-slate-700 rounded-xl text-center text-slate-500">
                    No hay cuentas bancarias registradas.
                  </div>
                )}
                
                <div className="space-y-4">
                  {fields.map((item, index) => (
                    <div key={item.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl relative pr-12">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute right-4 top-4 p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                      
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-500">Banco</Label>
                          <input 
                            {...register(`bankAccounts.${index}.bankName` as const)} 
                            placeholder="Ej. BBVA" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-500">Número de Cuenta / CLABE</Label>
                          <input 
                            {...register(`bankAccounts.${index}.accountNumber` as const)} 
                            placeholder="1234567890" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-500">Beneficiario</Label>
                          <input 
                            {...register(`bankAccounts.${index}.beneficiary` as const)} 
                            placeholder="Juan Pérez" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all w-full md:w-auto">
                Guardar Ajustes Generales
              </button>
            </div>
          </div>

          <div className={activeTab === 'about' ? 'block' : 'hidden'}>
            <h3 className="text-xl font-bold text-white mb-6">Información Pública ("Quiénes Somos")</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-400">¿Quiénes somos? (Descripción o historia completa)</Label>
                <textarea 
                  {...register('aboutUs')} 
                  rows={8} 
                  placeholder="Somos una plataforma de rifas transparentes..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200 resize-none" 
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-400">Dirección (Opcional)</Label>
                  <input 
                    {...register('address')} 
                    placeholder="Ej. Av. Principal 123, Ciudad" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-400">Teléfono Directo (Para Dudas)</Label>
                  <input 
                    {...register('contactPhone')} 
                    placeholder="Ej. 123-456-7890" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-400">Correo Electrónico de Contacto</Label>
                  <input 
                    type="email"
                    {...register('contactEmail')} 
                    placeholder="Ej. contacto@rifaspremium.com" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-400">URL Facebook</Label>
                  <input 
                    type="url"
                    {...register('facebookUrl')} 
                    placeholder="https://facebook.com/..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-400">URL Instagram</Label>
                  <input 
                    type="url"
                    {...register('instagramUrl')} 
                    placeholder="https://instagram.com/..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
                  />
                </div>
              </div>

              <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all w-full md:w-auto">
                Guardar Información
              </button>
            </div>
          </div>
        </form>

        <div className={activeTab === 'admins' ? 'block' : 'hidden'}>
          <h3 className="text-xl font-bold text-white mb-6">Cuentas de Administrador</h3>
          
          <div className="mb-8">
            <form onSubmit={handleCreateAdmin} className="space-y-4 bg-slate-950 p-6 rounded-xl border border-slate-800 md:max-w-md">
              <h4 className="text-base font-bold text-slate-300">Añadir Nuevo Administrador</h4>
              <div className="space-y-2">
                <Label className="text-slate-400">Nombre y Apellido</Label>
                <input 
                  type="text"
                  required
                  value={newAdminName}
                  onChange={e => setNewAdminName(e.target.value)}
                  placeholder="Ej. Juan Pérez" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Correo Electrónico</Label>
                <input 
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  placeholder="correo@ejemplo.com" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400">Contraseña</Label>
                <input 
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={e => setNewAdminPassword(e.target.value)}
                  placeholder="Escribe la contraseña" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
                />
              </div>
              <button type="submit" className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-emerald-900/20">
                <Plus className="w-5 h-5 mr-2" />
                Crear Admin
              </button>
            </form>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Lista de Administradores</h4>
            {admins.map((admin) => (
              <div key={admin.id} className="flex justify-between items-center p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-base font-bold text-slate-200">{admin.name || 'Administrador'}</div>
                  <div className="text-sm text-slate-500">{admin.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEditAdminClick(admin)}
                    className="text-slate-500 hover:text-blue-400 transition-colors p-2"
                    title="Editar cuenta"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteAdminClick(admin)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-2"
                    title="Eliminar cuenta"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-slate-500 text-sm">No hay administradores registrados.</p>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!adminToDelete} onOpenChange={(open) => !open && setAdminToDelete(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <DialogTitle className="text-center text-xl">Eliminar Administrador</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-slate-300">
              ¿Estás seguro que deseas eliminar la cuenta de administrador <span className="font-bold text-white">{adminToDelete?.email}</span>?
            </p>
            <p className="text-slate-500 text-sm mt-2">Esta acción no se puede deshacer.</p>
            {deleteError && (
              <div className="mt-4 p-3 bg-red-500/10 text-red-400 text-sm rounded-lg">
                {deleteError}
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2 sm:justify-center">
            <Button 
              variant="outline" 
              onClick={() => setAdminToDelete(null)}
              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteAdmin}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Eliminar Definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!adminToEdit} onOpenChange={(open) => !open && setAdminToEdit(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Editar Administrador</DialogTitle>
          </DialogHeader>
          <form onSubmit={confirmEditAdmin} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-slate-400">Nombre y Apellido</Label>
              <input 
                type="text"
                required
                value={editAdminName}
                onChange={e => setEditAdminName(e.target.value)}
                placeholder="Ej. Juan Pérez" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Correo Electrónico</Label>
              <input 
                type="email"
                required
                value={editAdminEmail}
                onChange={e => setEditAdminEmail(e.target.value)}
                placeholder="correo@ejemplo.com" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Nueva Contraseña (Opcional)</Label>
              <input 
                type="password"
                value={editAdminPassword}
                onChange={e => setEditAdminPassword(e.target.value)}
                placeholder="Dejar en blanco para mantener la actual" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-200" 
              />
            </div>
            
            {editError && (
              <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-lg">
                {editError}
              </div>
            )}
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setAdminToEdit(null)}
                className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
