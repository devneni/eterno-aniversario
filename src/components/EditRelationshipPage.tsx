import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useLanguage } from './useLanguage';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { uploadImagesToFirebase } from "../firebase/uploadImagesToFirebase";
import { getStorage, ref, deleteObject } from "firebase/storage";

const EditRelationshipPage: React.FC = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || '';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const [coupleName, setCoupleName] = useState("");
  const [coupleMessage, setCoupleMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#ec4899");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  const publicUrl = useMemo(() => id ? `${window.location.origin}/para_sempre/${id}` : "", [id]);
  const successUrl = useMemo(() => id ? `/detalhes_do_relacionamento/${id}` : "#", [id]);

  const loadDoc = useCallback(async () => {
    if (!id) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const snap = await getDoc(doc(db, "BIRTHDAY_LOVE", id));
      if (!snap.exists()) {
        setError(language === 'pt' ? 'Documento não encontrado.' : 'Document not found.');
        return;
      }
      const data: any = snap.data();
      setCoupleName(data?.coupleName || "");
      setCoupleMessage(data?.coupleMessage || "");
      setStartDate(data?.startDate || "");
      setStartTime(data?.startTime || "");
      setTextColor(data?.textColor || "#ffffff");
      setBackgroundColor(data?.backgroundColor || "#ec4899");
      setYoutubeLink(data?.youtubeLink || "");
      const urls = Array.isArray(data?.imagesUrl) ? (data.imagesUrl as string[]) : [];
      setImages(urls);
      setOriginalImages(urls);
      setSelectedPlan(data?.selectedPlan || "");
    } catch (e) {
      setError(language === 'pt' ? 'Erro ao carregar dados.' : 'Error loading data.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, language]);

  useEffect(() => {
    loadDoc();
  }, [loadDoc]);

  
  useEffect(() => {
    const urls = newFiles.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach(u => URL.revokeObjectURL(u));
    };
  }, [newFiles]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      console.log("🖼️ Salvar clicado. Imagens atuais:", images.length, "novos arquivos:", newFiles.length);
      
      const planLimits: Record<string, number> = { "Básico": 3, "Premium": 5, "Deluxe": 10 };
      const limit = planLimits[selectedPlan] ?? 5;

      
      let finalImages = Array.from(new Set(images));

      
      const sameImages = finalImages.length === originalImages.length && finalImages.every(u => originalImages.includes(u));
      if (newFiles.length === 0 && sameImages) {
        console.log("ℹ️ Sem alterações em imagens. Salvando apenas metadados.");
        await updateDoc(doc(db, "BIRTHDAY_LOVE", id), {
          coupleName,
          coupleMessage,
          startDate,
          startTime,
          textColor,
          backgroundColor,
          youtubeLink,
          updatedAt: new Date(),
        });
        setMessage(language === 'pt' ? 'Alterações salvas!' : 'Changes saved!');
        setSaving(false);
        return;
      }

    
      if (newFiles.length > 0) {
        const allowedSlots = Math.max(0, limit - finalImages.length);
        const filesToUpload = newFiles.slice(0, allowedSlots);
        if (newFiles.length > filesToUpload.length) {
          setMessage(language === 'pt' ? `Limite de ${limit} imagens atingido. Apenas ${filesToUpload.length} adicionada(s).` : `Limit of ${limit} images reached. Only ${filesToUpload.length} added.`);
        }
        console.log("🚀 Enviando arquivos:", filesToUpload.map(f=>({name:f.name,size:f.size,type:f.type})));
        const uploaded = await uploadImagesToFirebase(filesToUpload, id);
        console.log("✅ Upload concluído. URLs:", uploaded);
        finalImages = Array.from(new Set([...finalImages, ...uploaded]));
      }
    
      const removed = originalImages.filter((url) => !finalImages.includes(url));
      if (removed.length > 0) {
        const storage = getStorage();
        await Promise.all(
          removed.map(async (url) => {
            try {
              const fileRef = ref(storage, url);
              await deleteObject(fileRef);
            } catch (e) {
              console.warn("Falha ao remover do Storage:", url, e);
            }
          })
        );
      }
      console.log("📝 Atualizando Firestore imagesUrl:", finalImages.length);
      await updateDoc(doc(db, "BIRTHDAY_LOVE", id), {
        coupleName,
        coupleMessage,
        startDate,
        startTime,
        textColor,
        backgroundColor,
        youtubeLink,
        imagesUrl: finalImages,
        imageFileNames: finalImages.map((_, index) => `image_${index}_${Date.now()}`),
        updatedAt: new Date(),
      });
      setMessage(language === 'pt' ? 'Alterações salvas!' : 'Changes saved!');
      setNewFiles([]);
      setImages(finalImages);
      setOriginalImages(finalImages);
      
      try { const input = document.getElementById('add-files') as HTMLInputElement | null; if (input) input.value = ''; } catch {}
     
      try {
        const snap = await getDoc(doc(db, "BIRTHDAY_LOVE", id));
        console.log("🔁 Recarregado do Firestore após salvar:", snap.exists() ? snap.data()?.imagesUrl : null);
      } catch (e) { console.warn("⚠️ Falha ao refetch após salvar", e); }
    } catch (e) {
      setError(language === 'pt' ? 'Erro ao salvar alterações.' : 'Error saving changes.');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-400 to-purple-600 relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10 p-6 max-w-3xl mx-auto">
        <div className="bg-white/15 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
          <h1 className="text-3xl font-black mb-2">
            {language === 'pt' ? 'Editar Relacionamento' : 'Edit Relationship'}
          </h1>
         

          {error && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 mb-4">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-3 mb-4">
              {message}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center">{language === 'pt' ? 'Carregando...' : 'Loading...'}</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">{language === 'pt' ? 'Nome do Casal' : 'Couple Name'}</label>
                  <input value={coupleName} onChange={e=>setCoupleName(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm mb-1">{language === 'pt' ? 'Link do YouTube (música)' : 'YouTube Link (music)'}</label>
                  <input value={youtubeLink} onChange={e=>setYoutubeLink(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none" placeholder="https://www.youtube.com/watch?v=..." />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">{language === 'pt' ? 'Mensagem' : 'Message'}</label>
                <textarea value={coupleMessage} onChange={e=>setCoupleMessage(e.target.value)} rows={3} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">{language === 'pt' ? 'Data do relacionamento' : 'Relationship Date'}</label>
                  <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm mb-1">{language === 'pt' ? 'Hora' : 'Time'}</label>
                  <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">{language === 'pt' ? 'Cor do Texto' : 'Text Color'}</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)} className="w-12 h-12 rounded-lg border border-white/30" />
                    <input value={textColor} onChange={e=>setTextColor(e.target.value)} className="flex-1 p-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">{language === 'pt' ? 'Cor de Fundo' : 'Background Color'}</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={backgroundColor} onChange={e=>setBackgroundColor(e.target.value)} className="w-12 h-12 rounded-lg border border-white/30" />
                    <input value={backgroundColor} onChange={e=>setBackgroundColor(e.target.value)} className="flex-1 p-3 bg-white/10 border border-white/20 rounded-xl text-white outline-none" />
                  </div>
                </div>
              </div>

            
              <div className="space-y-3">
                <label className="block text-sm mb-1">{language === 'pt' ? 'Imagens' : 'Images'}</label>
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt={`Imagem ${idx+1}`} className="w-full h-24 object-cover rounded-xl shadow" />
                        <button
                          type="button"
                          onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-2 -right-2 bg-red-600 text-white w-7 h-7 rounded-full shadow hidden group-hover:block"
                          title={language === 'pt' ? 'Remover' : 'Remove'}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/70">{language === 'pt' ? 'Sem imagens' : 'No images'}</p>
                )}

                <div className="border-2 border-dashed border-white/30 rounded-2xl p-4 text-center">
                  <input
                    id="add-files"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e)=>{
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      
                      const planLimits: Record<string, number> = { "Básico": 3, "Premium": 5, "Deluxe": 10 };
                      const limit = planLimits[selectedPlan] ?? 5;
                      const totalCurrent = images.length + newFiles.length;
                      const available = Math.max(0, limit - totalCurrent);
                      const filesAllowed = files.slice(0, available);
                      setNewFiles(prev => [...prev, ...filesAllowed]);
                      if (files.length > filesAllowed.length) {
                        setMessage(language === 'pt' ? `Limite de ${limit} imagens atingido. Apenas ${filesAllowed.length} selecionada(s).` : `Limit of ${limit} images reached. Only ${filesAllowed.length} selected.`);
                      }
                    }}
                  />
                  <label htmlFor="add-files" className="cursor-pointer inline-block bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl">
                    {language === 'pt' ? 'Adicionar imagens' : 'Add images'}
                  </label>
                  {newFiles.length > 0 && (
                    <p className="mt-2 text-white/80 text-sm">
                      {language === 'pt' ? `${newFiles.length} novas imagem(ns) selecionada(s)` : `${newFiles.length} new image(s) selected`}
                    </p>
                  )}
                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {previews.map((src, idx) => (
                        <div key={idx} className="relative group">
                          <img src={src} alt={`preview-${idx+1}`} className="w-full h-24 object-cover rounded-xl shadow" />
                          <button
                            type="button"
                            onClick={() => setNewFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute -top-2 -right-2 bg-red-600 text-white w-7 h-7 rounded-full shadow hidden group-hover:block"
                            title={language === 'pt' ? 'Remover' : 'Remove'}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <button onClick={handleSave} disabled={saving || !id} className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-2xl transition-all">
                  {saving ? (language === 'pt' ? 'Salvando...' : 'Saving...') : (language === 'pt' ? 'Salvar' : 'Save')}
                </button>
                <Link to={successUrl} className={`flex-1 text-center bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-2xl transition-all ${id ? '' : 'pointer-events-none opacity-60'}`}>
                  {language === 'pt' ? 'Voltar ' : 'Back '}
                </Link>
                <a href={publicUrl} target="_blank" rel="noreferrer" className={`flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl transition-all ${publicUrl ? '' : 'pointer-events-none opacity-60'}`}>
                  {language === 'pt' ? 'Ver Página Pública' : 'View Public Page'}
                </a>
              </div>
              <p className="text-white/70 text-xs mt-2">{language === 'pt' ? 'Dica: após salvar, abra a página pública para conferir se as imagens aparecem.' : 'Tip: after saving, open the public page to confirm images appear.'}</p>
            </div>
          )}

          {!id && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-4 mb-6">
              {language === 'pt' ? 'Forneça o parâmetro ?id na URL.' : 'Provide ?id parameter in the URL.'}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default EditRelationshipPage;
