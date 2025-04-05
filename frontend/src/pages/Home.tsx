import './App.css'
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel.tsx";
import {useTRPC} from "@/utils/trpc.ts";
import {useQuery} from "@tanstack/react-query";

function Home() {

  const trpc = useTRPC();
  const imageUrlListQuery = useQuery(trpc.image.getThumbnailUrls.queryOptions());

  if (imageUrlListQuery.isLoading) {
    return <div>Loading...</div>
  }

  if (imageUrlListQuery.isError && imageUrlListQuery.error.data?.code === 'UNAUTHORIZED') {
    return <div>Login to view images</div>
  }

  if (imageUrlListQuery.data?.length === 0) {
    return <div>No images</div>
  }

  return (
    <div className="flex flex-col min-h-svh">
      <Carousel opts={{loop: true}}>
        <CarouselContent>
          {
            imageUrlListQuery.data?.map(url =>
              <CarouselItem key={url} className={'basis-1/3'}>
                <img src={url} alt={url}/>
              </CarouselItem>)
          }
        </CarouselContent>
        <CarouselPrevious/>
        <CarouselNext/>
      </Carousel>
    </div>
  )
}

export default Home
