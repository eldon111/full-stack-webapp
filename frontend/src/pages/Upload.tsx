import {StrictMode, useState} from 'react'
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
import {useQuery} from "@tanstack/react-query";
import {useTRPC, useTRPCClient} from "@/utils/trpc.ts";
import axios from 'axios';
import {Progress} from "@/components/ui/progress.tsx";

type UploadProgress = Record<string, { progress: number }>

function Upload() {

  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const loggedInQuery = useQuery(trpc.users.loggedIn.queryOptions());

  // const [uploads, setUploads] = useState<Map<string, number>>(new Map());
  const [uploads, setUploads] = useState<UploadProgress>({});

  const updateData = (filename: string, value: number) => {
    setUploads(prevData =>  ({
      ...prevData,
      [filename]: { progress: value }
    }));
  };

  if (loggedInQuery.isLoading) {
    return <div>Loading...</div>
  }

  if (loggedInQuery.data === false) {
    return <div>Login to upload images</div>
  }

  const handleFilesUploaded = async function <T extends File>(files: T[], event: DropEvent) {
    console.log('event:', event);

    const progresses: UploadProgress = Object.fromEntries(files.map(file => [file.name, {progress: 0}]));
    setUploads(progresses);

    const promises: Promise<void>[] = files.map(
      async file => {
        const uploadUrl = await trpcClient.image.uploadUrl.query({filename: file.name});
        axios.put(uploadUrl, await file.arrayBuffer(), {
          headers: {
            'Content-Type': file.type,
          },
          onUploadProgress: (progressEvent) => {
            updateData(file.name, (progressEvent.progress ?? 0) * 100);
          },
        })
          .then(response => {
            console.log('File upload response:', response);
          })
          .catch(error => {
            console.error(`Error uploading file ${file.name}: ${error.message}`);
          })
      }
    )

    await Promise.all(promises);
  }

  return (
    <StrictMode>
      <div className={'flex flex-col items-center gap-4 w-1/3'}>
        <div className={'flex flex-row'}>
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
        </div>
        {Object.entries(uploads).map(([filename, {progress}]) =>
          <div key={filename} className={'flex flex-row w-full'}>
            <div className={'flex flex-col w-full items-start'}>
              <span>{filename}</span>
              <Progress value={progress}/>
            </div>
          </div>
        )}
      </div>
    </StrictMode>
  )
}

export default Upload
