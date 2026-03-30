import axios from "axios";

const getVideos = async (query) => {
  const resp = await axios.get('/api/youtube', {
    params: { q: query },
  });
  return resp.data;
};

export default {
  getVideos,
};
