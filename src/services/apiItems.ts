import axios from 'axios';

const apiItems = axios.create({
     baseURL: "http://localhost:8010/"
});
//
export default apiItems;