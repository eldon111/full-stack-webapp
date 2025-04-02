import {StrictMode, useEffect, useState} from 'react'
import '../index.css'
import {
  Dropzone,
  DropzoneDescription,
  DropzoneGroup,
  DropzoneInput,
  DropzoneTitle,
  DropzoneUploadIcon,
  DropzoneZone
} from "@/components/ui/dropzone.tsx";
import {DropEvent} from "react-dropzone";

function Upload() {

  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoggedInStatus = async () => {
      // TODO: create user info endpoint
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/storage/image/list`, {credentials: 'include'});
      setIsLoading(false)
      if (!response.ok) {
        return;
      }
      setIsLoggedIn(true);
    };
    checkLoggedInStatus();
  }, []);

  async function handleFilesUploaded<T extends File>(files: T[], event: DropEvent): Promise<void> {
    console.log('event:', event)

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/storage/image/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Error uploading file.');
      return
    }

    const result: { message: string; fileName: string; destination: string } = await response.json();
    console.log('File upload result:', result);
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isLoggedIn) {
    return <div>Login to upload images</div>
  }

  return (
    <StrictMode>
      <Dropzone
        accept={{
          "image/*": [".jpg", ".jpeg", ".png", ".webp"],
        }}
        multiple={true}
        onDropAccepted={handleFilesUploaded}
      >
        <DropzoneZone>
          <DropzoneInput/>
          <DropzoneGroup className="gap-4">
            <DropzoneUploadIcon/>
            <DropzoneGroup>
              <DropzoneTitle>Drop files here or click to upload</DropzoneTitle>
              <DropzoneDescription>
                You can upload files up to 10MB in size. Supported formats: JPG, PNG
              </DropzoneDescription>
            </DropzoneGroup>
          </DropzoneGroup>
        </DropzoneZone>
      </Dropzone>
    </StrictMode>
  )
}

export default Upload
