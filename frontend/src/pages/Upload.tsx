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
import {useQuery} from "@tanstack/react-query";
import {useTRPC, useTRPCClient} from "@/utils/trpc.ts";
import axios from 'axios';
import {Progress} from "@/components/ui/progress.tsx";

type UploadProgress = Record<string, { progress: number }>
type ThumbnailComplete = Record<string, { complete: boolean }>

function Upload() {

  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const loggedInQuery = useQuery(trpc.users.loggedIn.queryOptions());

  const [uploads, setUploads] = useState<UploadProgress>({});
  const [thumbnailsComplete, setThumbnailsComplete] = useState<ThumbnailComplete>({});

  const updateUploadProgress = (filename: string, value: number) => {
    setUploads(prevData => ({
      ...prevData,
      [filename]: {progress: value}
    }));
  };
  const updateThumbnailComplete = (filename: string, value: boolean) => {
    setThumbnailsComplete(prevData => ({
      ...prevData,
      [filename]: {complete: value}
    }));
  };

  useEffect(() => {
    const subscription = trpcClient.image.waitForThumbnail.subscribe(undefined, {
      onData: (filename: string) => {
        console.log("got data from thumbnail subscription:", filename);
        updateThumbnailComplete(filename, true);
      },
    });

    // Clean up on component unmount
    return () => {
      console.log("unsubscribing from thumbnail subscription");
      subscription.unsubscribe?.();
    };
  }, []);

  if (loggedInQuery.isLoading) {
    return <div>Loading...</div>
  }

  if (loggedInQuery.data === false) {
    return <div>Login to upload images</div>
  }

  const handleFilesUploaded = async function <T extends File>(files: T[]) {
    setThumbnailsComplete({});

    const progresses: UploadProgress = Object.fromEntries(files.map(file => [file.name, {progress: 0}]));
    setUploads(progresses);

    const promises: Promise<void>[] = files.map(
      async file => {
        const uploadUrl = await trpcClient.image.uploadUrl.query({filename: file.name});
        await axios
          .put(uploadUrl, await file.arrayBuffer(), {
            headers: {
              'Content-Type': file.type,
            },
            onUploadProgress: (progressEvent) => {
              updateUploadProgress(file.name, Math.round((progressEvent.progress ?? 0) * 100));
            },
          })
          .then(response => {
            console.log('File upload response:', response);
          })
          .catch(error => {
            console.error(`Error uploading file ${file.name}: ${error.message}`);
          });
        updateThumbnailComplete(file.name, false);
      }
    )

    await Promise.all(promises);
  }

  return (
    <StrictMode>
      <div className={'flex flex-col items-center gap-4'}>
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
              <div className={'flex flex-row w-full items-baseline place-content-between text-left'}>
                <Progress value={progress}/>
              </div>
              <div className={'flex flex-row w-full items-center'}>
              {thumbnailsComplete[filename]
                ? thumbnailsComplete[filename]?.complete
                  ? <span>Thumbnail ready&nbsp;&#x2705;</span>
                  : <span>Thumbnail processing <i className="c-inline-spinner"/></span>
                : <span>&nbsp;</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </StrictMode>
  )
}

export default Upload
