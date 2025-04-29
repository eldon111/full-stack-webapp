import './App.css';
import { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useTRPC } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';
import { ImageDialog } from '@/components/ui/image-dialog';
import { TRPCClientError } from '@trpc/client';
import { AnyClientTypes } from '@trpc/server/unstable-core-do-not-import';

function Home() {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const trpc = useTRPC();

  const thumbnailUrlsQuery = useQuery(trpc.image.getThumbnailUrls.queryOptions());
  const fullImageUrlsQuery = useQuery(trpc.image.getImageUrls.queryOptions());

  const isLoading = thumbnailUrlsQuery.isLoading || fullImageUrlsQuery.isLoading;
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (thumbnailUrlsQuery.isError) {
    // Check if it's a TRPCClientError with an UNAUTHORIZED code
    const error = thumbnailUrlsQuery.error as TRPCClientError<AnyClientTypes>;
    if (error.data?.code === 'UNAUTHORIZED') {
      return <div>Login to view images</div>;
    }
    return <div>Error loading images</div>;
  }

  const thumbnailUrls = (thumbnailUrlsQuery.data as string[]) || [];
  if (thumbnailUrls.length === 0) {
    return <div>No images</div>;
  }

  const fullImageUrls = (fullImageUrlsQuery.data as string[]) || [];

  const handleThumbnailClick = (index: number) => {
    if (fullImageUrls[index]) {
      setSelectedImageUrl(fullImageUrls[index]);
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedImageUrl(null);
  };

  return (
    <div className="flex flex-col min-h-svh">
      <Carousel opts={{ loop: true }}>
        <CarouselContent>
          {thumbnailUrls.map((url, index) => (
            <CarouselItem key={url} className={'basis-1/3'}>
              <div
                className="cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => handleThumbnailClick(index)}
              >
                <img src={url} alt={`Thumbnail ${index + 1}`} className="rounded-md" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <ImageDialog isOpen={isDialogOpen} onClose={handleCloseDialog} imageUrl={selectedImageUrl} />
    </div>
  );
}

export default Home;
