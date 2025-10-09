function previewImage(event: Event): void {
  const input = event.target as HTMLInputElement;

  const previewImageElement = document.getElementById(
    "imagePreview"
  ) as HTMLImageElement;
  const placeholderText = document.getElementById(
    "placeholderText"
  ) as HTMLElement;

  if (input.files && input.files[0] && previewImageElement && placeholderText) {
    const file = input.files[0];

    const reader = new FileReader();

    reader.onload = function (e: ProgressEvent<FileReader>) {
      if (e.target && typeof e.target.result === "string") {
        previewImageElement.src = e.target.result;

        // Exibe a imagem e esconde o placeholder
        previewImageElement.classList.remove("hidden");
        placeholderText.classList.add("hidden");
      }
    };

    reader.readAsDataURL(file);
  } else {
    if (previewImageElement && placeholderText) {
      previewImageElement.src = "";
      previewImageElement.classList.add("hidden");
      placeholderText.classList.remove("hidden");
    }
  }
}

export { previewImage };
