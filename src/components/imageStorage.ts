export const convertFilesToDataUrls = (files: File[]): Promise<string[]> => {
  const imagePromises = files.map(file => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  });

  return Promise.all(imagePromises);
};

export const saveImagesToStorage = (dataUrls: string[]): void => {
  try {
    localStorage.setItem('userImages', JSON.stringify(dataUrls));
  } catch (error) {
    console.error('Erro ao salvar imagens no localStorage:', error);
    // Limpa se estiver cheio
    localStorage.removeItem('userImages');
  }
};

export const getImagesFromStorage = (): string[] => {
  try {
    const storedImages = localStorage.getItem('userImages');
    return storedImages ? JSON.parse(storedImages) : [];
  } catch (error) {
    console.error('Erro ao carregar imagens do localStorage:', error);
    return [];
  }
};

export const clearImagesFromStorage = (): void => {
  localStorage.removeItem('userImages');
};