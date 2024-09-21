/**
 * @param dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD//gB...'; data chain here
 * @param filename = 'my_file'; file name here
 * @param mimeType MIME type of the file (can be 'image/jpeg', 'application/pdf', etc.)
 * @returns
 */
export const dataURLtoFile = (
  dataUrl: string,
  filename: string,
  mimeType: string
) => {
  const ext = mimeType.split('/');
  filename += '.' + ext[ext.length - 1];
  console.log(ext, filename);
  if (!dataUrl || !filename || !mimeType) {
    throw new Error('Los datos de entrada son incorrectos.');
  }
  const arr = dataUrl.split(',');
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);

  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new File([u8arr], filename, { type: mimeType });
};
