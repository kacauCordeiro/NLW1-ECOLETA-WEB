import React, { useState, ChangeEvent, useCallback, FormEvent} from 'react';

import './styles.css';
import {FiLogIn, FiLogOut, FiSearch} from 'react-icons/fi';
import logo from './../../assets/logo.svg';
import { Link , useHistory} from 'react-router-dom';
import useModal from 'use-react-modal'
import './modal.css';
import { useEffect } from 'react';
import apiUfs from './../../services/apiUfs';
import apiItems from './../../services/apiItems';

interface States{
     nome: string,
     sigla: string,
}

interface Cities{
     nome: string,
}

const Home  = () => {

     const history = useHistory();
     const [ufs, setUfs] = useState<States[]>([]);
     const [cities, setCities] = useState<Cities[]>([]);
     const [selectedUf, setSelectedUf] = useState<string>('0');
     const [selectedCity, setSelectedCity] = useState<string>('0');
     const { isOpen, openModal, closeModal, Modal } = useModal()

     function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
          setSelectedUf(event.target.value);
     }

     function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
          setSelectedCity(event.target.value);
     }

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
     
        const handleSubmit = useCallback(
          async (event: FormEvent) => {
            event.preventDefault();
      
            try {
              const data = new FormData();
      
              data.append('uf', selectedUf);
              data.append('city', selectedCity);
      
      
              await apiItems.get('points/?');
      
              history.push('/');
            } catch (err) {
              console.log('ERRROR')
            }
          },
          [selectedUf, selectedCity, history],
        );
     
     return(
          <div id="page-home">
               <div className="content">
                    <header> 
                         <img alt="Ecoleta" src={logo}/>
                    </header>
                    <main>
                         <h1>Seu marketplace de coleta de resíduos.</h1>
                         <p>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente</p>
                         <Link to="/create-point">
                              <span>
                                   <FiLogIn/>
                              </span>
                              <strong>Cadastre um ponto de coleta</strong>
                         </Link>
                         <>
                         <Link to='/' onClick={openModal}>
                              <span>
                                   <FiLogIn/>
                              </span>
                              <strong>Encontrar um ponto de coleta</strong>
                         </Link>
      {isOpen && (
               <Modal id="modal">
                   
          <div>
                <div className="content">
                <header>
                    <h1>Pontos de Coleta</h1>
                    <Link to='/' onClick={closeModal}><FiLogOut/></Link>
                    
               </header>

               <form onSubmit={handleSubmit}>

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
                              <div className="field">
                              <button type="submit"> <Link to="/page-search">
                              <span>
                              <FiSearch/>
                              </span>
                              <strong> Buscar </strong>
                         </Link>         </button>
                              </div>
                         

                         </div>   
               </form>
          
               </div>
          </div>
               </Modal>
      )
      }</>

                    </main>
               </div>

          </div>
          
     );
}
export default Home;