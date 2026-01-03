import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PhotoGrid from '../components/PhotoGrid';
import { photoApi } from '../services/api';
import './Explore.css';

const Explore = () => {
  const [searchParams] = useSearchParams();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const query = searchParams.get('q');
  const sort = searchParams.get('sort');

  useEffect(() => {
    loadPhotos();
  }, [query, sort]);

  const loadPhotos = async (loadMore = false) => {
    setLoading(!loadMore);
    try {
      let res;
      if (query) {
        res = await photoApi.search(query);
      } else if (sort === 'trending') {
        res = await photoApi.getTrending();
      } else {
        res = await photoApi.getAll(loadMore ? page + 1 : 1, 12);
      }
      
      const newPhotos = res.data || [];
      setPhotos(loadMore ? [...photos, ...newPhotos] : newPhotos);
      setHasMore(newPhotos.length === 12);
      if (loadMore) setPage(p => p + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="explore-page">
      <div className="explore-header">
        <h1>
          {query ? (
            <>Search results for "{query}"</>
          ) : sort === 'trending' ? (
            <><i className="fas fa-fire"></i> Trending Photos</>
          ) : (
            <><i className="fas fa-compass"></i> Explore</>
          )}
        </h1>
        <p>{photos.length} photos found</p>
      </div>

      <PhotoGrid photos={photos} loading={loading} />

      {hasMore && !loading && !query && (
        <div className="load-more">
          <button className="btn btn-outline" onClick={() => loadPhotos(true)}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default Explore;
