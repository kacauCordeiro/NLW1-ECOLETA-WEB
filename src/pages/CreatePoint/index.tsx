import React, {useEffect, useState, ChangeEvent, FormEvent, useCallback} from 'react';
import {Link, useHistory} from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import {Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import apiItems from './../../services/apiItems';
import apiUfs from './../../services/apiUfs';

import Dropzone from '../../components/Dropzone';

import './styles.css';
import logo from './../../assets/logo.svg';

interface Item{
     id: number,
     title: string,
     image_url: string,
}

interface States{
     nome: string,
     sigla: string,
}

interface Cities{
     nome: string,
}

const CreatePoint = () => {

     const [items, setItems] = useState<Item[]>([]);
     const [ufs, setUfs] = useState<States[]>([]);
     const [cities, setCities] = useState<Cities[]>([]);

     const [formData, setFormData] = useState({
          name: '',
          email: '',
          whatsapp: '',
          endereco: '',
     });

     const [selectedFile, setSelectedFile] = useState<File>();
     const [selectedItems, setSelectedItems] = useState<number[]>([]);
     const [selectedUf, setSelectedUf] = useState<string>('0');
     const [selectedCity, setSelectedCity] = useState<string>('0');
     
     const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
     const [selectedMapClick, setSelectedClickMap] = useState<[number, number]>([0,0]);
     

     const history = useHistory();

     const toastOptions = {
         // autoClose: 5000,
          hideProgressBar: false,
         // closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        };

// Get Current Position
     useEffect(() => {
          navigator.geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;
      
              setInitialPosition([latitude, longitude]);
            },
            () => {
              toast.error('❌ Oops! Algo deu errado =/', toastOptions);
            },
            {
              timeout: 30000,
              enableHighAccuracy: true,
            },
          );
        }, [toastOptions]);
 // Load items
        useEffect(() => {
          async function loadItems() {
            const response = await apiItems.get('items');
      
            setItems(response.data);
          }
      
          loadItems();
        }, []);
// Load UFs
      // Load UFs
  useEffect(() => {
     async function loadUfs() {
       const response = await apiUfs.get<States[]>(
         'localidades/estados?orderBy=nome',
       );
 
       const ufInitials = response.data.map(uf => {
         return {
           sigla: uf.sigla,
           nome: uf.nome,
         };
       });
 
       setUfs(ufInitials);
     }
 
     loadUfs();
   }, []);
 
   // Load Cities
   useEffect(() => {
     async function loadCities() {
       if (selectedUf === '0') return;
 
       const response = await apiUfs.get<Cities[]>(
         `localidades/estados/${selectedUf}/municipios`,
       );
 
       const cityNames = response.data.map(city => {
         return { nome: city.nome };
       });
 
       setCities(cityNames);
     }
 
     loadCities();
   }, [selectedUf]);

     function handleSelectedMapClick(event: LeafletMouseEvent){
     setSelectedClickMap([
          event.latlng.lat,
          event.latlng.lng,
     ]);
     }

     function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
          setSelectedUf(event.target.value);
     }

     function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
          setSelectedCity(event.target.value);
     }

     function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
     const { name, value } = event.target;

     setFormData({ ...formData, [name]: value });
     }

     function handleSelectItem(id: number) {
     const alreadySelected = selectedItems.findIndex(item => item === id);

     if (alreadySelected >= 0) {
          const filteredItems = selectedItems.filter(item => item !== id);

          setSelectedItems(filteredItems);
     } else {
          setSelectedItems([...selectedItems, id]);
     }
     }
 
// Toastify configurations
     

     const handleSubmit = useCallback(
          async (event: FormEvent) => {
            event.preventDefault();
      
            try {
              const { name, email, whatsapp, endereco } = formData;
              const [latitude, longitude] = selectedMapClick;
      
              const data = new FormData();
      
              data.append('name', name);
              data.append('email', email);
              data.append('endereco_completo', endereco);
              data.append('whatsapp', whatsapp);
              data.append('latitude', String(latitude));
              data.append('longitude', String(longitude));
              data.append('uf', selectedUf);
              data.append('city', selectedCity);
              data.append('items', selectedItems.join(','));
      
              if (selectedFile) {
                data.append('image', selectedFile);
              }
      
              await apiItems.post('points', data);
              toast('✅ Criado com sucesso!', toastOptions);
      
              history.push('/');
            } catch (err) {
              toast.error('❌ Erro!', toastOptions);
            }
          },
          [formData, selectedMapClick, selectedUf, selectedCity, selectedItems, selectedFile, toastOptions, history],
        );

     return (
          <div id="page-create-point">
               <header>
                    <img src={logo} alt="Ecoleta"/>
                    <Link to="/">
                         <FiArrowLeft/>
                         Voltar para home
                    </Link>
               </header>
               <form onSubmit={handleSubmit}>
                    <h1>
                         Cadastro do<br/> ponto de coleta
                    </h1>

                    <Dropzone onFileUploaded={setSelectedFile} />   

                    <fieldset>
                         <legend>
                              <h2>Dados</h2>
                         </legend>
                         <div className="field">
                              <label htmlFor="name">Nome da entidade</label>
                              <input type="text" name="name" id="name" onChange={handleInputChange}/>
                         </div>
                         <div className="field">
                                   <label htmlFor="endereco">Endereço completo: (Ex: Rua ... n° ...)</label>
                                   <input type="text" name="endereco" id="endereco" onChange={handleInputChange}/>
                              </div>
                         <div className="field-group">
                              <div className="field">
                                   <label htmlFor="email">Email</label>
                                   <input type="email" name="email" id="email" onChange={handleInputChange}/>
                              </div>
                              <div className="field">
                                   <label htmlFor="whatsapp">Whatsapp</label>
                                   <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
                              </div>
                         </div>          
                    </fieldset>

                    <fieldset>
                         <legend>
                              <h2>Endereço</h2>
                              <span>Selecione um ou mais endereços no mapa</span>
                         </legend>

                         <Map center={initialPosition} zoom={15} onClick={handleSelectedMapClick}>
                              <TileLayer
                                   attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Marker position={selectedMapClick} />
                         </Map>

                         <div className="field-group">
                              <div className="field">
                                   <label htmlFor="uf">Estado (UF)</label>
                                   <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                                        <option value="0">Selecione um estado</option>
                                        {ufs.map(uf => {
                                             return(
                                                  <option key={uf.nome} value={uf.sigla}>{uf.sigla}</option>
                                             )
                                        })}
                                   </select>
                              </div>
                              <div className="field">
                                   <label htmlFor="city">Cidade</label>
                                   <select name="city" id="city" value={selectedCity} onChange={handleSelectCity} required>
                                        <option value="0">Selecione uma cidade</option>
                                        {cities.map(city => {
                                             return(
                                                  <option key={city.nome} value={city.nome}>{city.nome}</option>
                                             )
                                        })}
                                   </select>
                              </div>
                         </div>    
                    </fieldset>
                    <fieldset>
                         <legend>
                              <h2>Items de coleta</h2>
                              <span>Selecione um ou mais endereços no mapa</span>
                         </legend>     
                                        <ul className="items-grid">
                         {items.map(item => (
                         <li
                              key={item.id}
                              onClick={() => handleSelectItem(item.id)}
                              className={selectedItems.includes(item.id) ? 'selected' : ''}
                         >
                              <img src={item.image_url} alt={item.title} />
                              <span>{item.title}</span>
                         </li>
            ))}
          </ul>
        </fieldset>
                    <button type="submit">Cadastrar ponto de coleta</button>
               </form>
          </div>
     );
}

export default CreatePoint;