import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ConsultantsManagerProps {
  token: string;
}

type Consultant = {
  id: number;
  name: string;
  role: string | null;
  roleEs: string | null;
  avatarUrl: string | null;
  whatsappNumber: string;
  active: boolean;
  sortOrder: number;
};

type FormData = {
  name: string;
  role: string;
  roleEs: string;
  whatsappNumber: string;
  avatarUrl: string;
};

const EMPTY_FORM: FormData = {
  name: "",
  role: "",
  roleEs: "",
  whatsappNumber: "",
  avatarUrl: "",
};

export function ConsultantsManager({ token }: ConsultantsManagerProps) {
  const utils = trpc.useUtils();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const meta = { headers: { Authorization: `Bearer ${token}` } };

  const consultantsQuery = trpc.consultants.list.useQuery(undefined, {
    meta,
    enabled: !!token,
  });

  const createMutation = trpc.consultants.create.useMutation({
    meta,
    onSuccess: () => {
      utils.consultants.list.invalidate();
      resetForm();
    },
  });

  const updateMutation = trpc.consultants.update.useMutation({
    meta,
    onSuccess: () => {
      utils.consultants.list.invalidate();
      resetForm();
    },
  });

  const deleteMutation = trpc.consultants.delete.useMutation({
    meta,
    onSuccess: () => utils.consultants.list.invalidate(),
  });

  const uploadAvatarMutation = trpc.consultants.uploadAvatar.useMutation({ meta });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setAvatarPreview(null);
    setUploadedAvatarUrl(null);
    setError(null);
    setSaving(false);
  };

  const startEdit = (c: Consultant) => {
    setForm({
      name: c.name,
      role: c.role ?? "",
      roleEs: c.roleEs ?? "",
      whatsappNumber: c.whatsappNumber,
      avatarUrl: c.avatarUrl ?? "",
    });
    setAvatarPreview(c.avatarUrl ?? null);
    setUploadedAvatarUrl(null);
    setEditingId(c.id);
    setShowForm(true);
    setError(null);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError("Imagem muito grande. Máximo 3MB.");
      return;
    }
    setUploadingAvatar(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      setAvatarPreview(ev.target?.result as string);
      try {
        const result = await uploadAvatarMutation.mutateAsync({
          imageBase64: base64,
          mimeType: file.type,
          consultantId: editingId ?? undefined,
        });
        setUploadedAvatarUrl(result.url);
        setForm(prev => ({ ...prev, avatarUrl: result.url }));
      } catch {
        setError("Falha ao fazer upload da imagem.");
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Nome é obrigatório."); return; }
    if (!form.whatsappNumber.trim()) { setError("WhatsApp é obrigatório."); return; }
    setSaving(true);
    setError(null);
    try {
      const avatarUrl = uploadedAvatarUrl || (form.avatarUrl.startsWith("http") ? form.avatarUrl : null);
      if (editingId !== null) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: form.name,
          role: form.role || undefined,
          roleEs: form.roleEs || undefined,
          whatsappNumber: form.whatsappNumber,
          avatarUrl: avatarUrl ?? null,
        });
      } else {
        await createMutation.mutateAsync({
          name: form.name,
          role: form.role || undefined,
          roleEs: form.roleEs || undefined,
          whatsappNumber: form.whatsappNumber,
          avatarUrl: avatarUrl ?? null,
        });
      }
    } catch (err: any) {
      setError(err?.message || "Erro ao salvar.");
      setSaving(false);
    }
  };

  const handleToggleActive = async (c: Consultant) => {
    await updateMutation.mutateAsync({ id: c.id, active: !c.active });
  };

  const handleMoveOrder = async (c: Consultant, direction: "up" | "down") => {
    const consultants = consultantsQuery.data ?? [];
    const idx = consultants.findIndex(x => x.id === c.id);
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= consultants.length) return;
    const target = consultants[targetIdx];
    await Promise.all([
      updateMutation.mutateAsync({ id: c.id, sortOrder: target.sortOrder }),
      updateMutation.mutateAsync({ id: target.id, sortOrder: c.sortOrder }),
    ]);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este consultor?")) return;
    await deleteMutation.mutateAsync({ id });
  };

  const consultants: Consultant[] = (consultantsQuery.data as Consultant[]) ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">Consultores</h2>
          <p className="text-gray-400 text-xs mt-0.5">
            Esses consultores aparecem na tela de feedback para os alunos entrarem em contato via WhatsApp.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); setAvatarPreview(null); setUploadedAvatarUrl(null); setError(null); }}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
        >
          + Adicionar Consultor
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="bg-white/5 border-white/20">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-white text-sm">
              {editingId !== null ? "Editar Consultor" : "Novo Consultor"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {/* Avatar upload */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-gray-400">👤</span>
                )}
              </div>
              <div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="text-xs border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
                >
                  {uploadingAvatar ? "Enviando..." : "📷 Escolher Foto"}
                </Button>
                <p className="text-gray-500 text-xs mt-1">JPG ou PNG, máx. 3MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Nome *</label>
                <Input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Lucas, Vicky, Ana..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 text-sm h-9"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">WhatsApp * (com DDI)</label>
                <Input
                  value={form.whatsappNumber}
                  onChange={e => setForm(p => ({ ...p, whatsappNumber: e.target.value }))}
                  placeholder="Ex: 5511999998888"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 text-sm h-9"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Cargo em inglês</label>
                <Input
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                  placeholder="Ex: Language Consultant"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 text-sm h-9"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Cargo em espanhol</label>
                <Input
                  value={form.roleEs}
                  onChange={e => setForm(p => ({ ...p, roleEs: e.target.value }))}
                  placeholder="Ex: Consultora de Idiomas"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 text-sm h-9"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={saving || uploadingAvatar}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
              >
                {saving ? "Salvando..." : editingId !== null ? "Salvar Alterações" : "Adicionar"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetForm}
                className="text-gray-400 hover:text-white text-xs"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consultants list */}
      {consultantsQuery.isLoading ? (
        <div className="text-center py-8 text-gray-400 text-sm">Carregando consultores...</div>
      ) : consultants.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">👥</div>
          <p className="text-gray-400 text-sm">Nenhum consultor cadastrado</p>
          <p className="text-gray-600 text-xs mt-1">Adicione consultores para aparecerem na tela de feedback</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consultants.map((c, idx) => (
            <Card key={c.id} className={`border transition-all ${c.active ? "bg-white/5 border-white/10" : "bg-white/2 border-white/5 opacity-60"}`}>
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">👤</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm">{c.name}</p>
                      <Badge className={`text-xs px-2 py-0 ${c.active ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>
                        {c.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    {c.role && <p className="text-gray-400 text-xs truncate">{c.role}</p>}
                    <p className="text-blue-400 text-xs">📱 +{c.whatsappNumber}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Reorder */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMoveOrder(c, "up")}
                        disabled={idx === 0}
                        className="text-gray-500 hover:text-white disabled:opacity-20 text-xs leading-none px-1"
                        title="Mover para cima"
                      >▲</button>
                      <button
                        onClick={() => handleMoveOrder(c, "down")}
                        disabled={idx === consultants.length - 1}
                        className="text-gray-500 hover:text-white disabled:opacity-20 text-xs leading-none px-1"
                        title="Mover para baixo"
                      >▼</button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleActive(c)}
                      className={`text-xs px-2 h-7 ${c.active ? "text-yellow-400 hover:text-yellow-300" : "text-green-400 hover:text-green-300"}`}
                      title={c.active ? "Desativar" : "Ativar"}
                    >
                      {c.active ? "⏸" : "▶"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(c)}
                      className="text-xs px-2 h-7 text-blue-400 hover:text-blue-300"
                      title="Editar"
                    >
                      ✏️
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(c.id)}
                      className="text-xs px-2 h-7 text-red-400 hover:text-red-300"
                      title="Remover"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 leading-relaxed">
        <strong>💡 Como funciona:</strong> Os consultores ativos aparecem na tela de feedback que os alunos veem ao final da experiência. Eles podem clicar no consultor para abrir uma conversa no WhatsApp. Recomendamos cadastrar 2 consultores para dar opção de escolha.
      </div>
    </div>
  );
}
