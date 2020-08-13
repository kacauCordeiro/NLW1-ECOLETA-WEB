import axios from 'axios';

const apiUfs = axios.create({
     baseURL: 'https://servicodados.ibge.gov.br/api/v1/',
});

export default apiUfs;