import './App.css'
import {useEffect, useState} from "react";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel.tsx";

function App() {

  const [urls, setUrls] = useState([]);

  useEffect(() => {
    const fetchUrls = async () => {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_BASE_URL}/storage/image/list`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      setUrls(json);
    };
    fetchUrls();
  }, []);

  if (urls.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-svh">
      <Carousel opts={{ loop: true }}>
        <CarouselContent>
          {
            urls.map(url =>
              <CarouselItem key={url} className={'basis-1/3'}>
                <img src={url} alt={url} />
              </CarouselItem>)
          }
        </CarouselContent>
        <CarouselPrevious/>
        <CarouselNext/>
      </Carousel>
    </div>
  )
}

export default App
