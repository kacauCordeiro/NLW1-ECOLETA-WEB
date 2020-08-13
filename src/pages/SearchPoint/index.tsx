import React, {useState, useEffect} from 'react';

import './search.css';
import logo from './../../assets/logo.svg';
// import {FiLogIn, FiLogOut, FiSearch} from 'react-icons/fi';
// import { Link , useHistory} from 'react-router-dom';
import apiItems from './../../services/apiItems';

interface Points{
     id: number,
     name: string,
     whatsapp: string,
     uf: string,
     city: string,
     image: string,
     endereco_completo: string

}

const SearchPoint = () => {

     const [points, setPoints] = useState<Points[]>([]);

     useEffect(() => {
          async function loadItems() {
            const response = await apiItems.get('points');
      
            setPoints(response.data);
          }
          loadItems();
        }, []);

     return(
          <div id="page-search">
               <header> 
                    <img alt="Ecoleta" src={logo}/>
                    {/* <Link to='/'>
                         <FiLogOut/>
                    </Link> */}
               </header>

               <fieldset>
                         <legend>
                              {/* <h3>Pontos de coleta encontrados</h3> */}
                         </legend>     
                    <ul className="points-grid">
                         {points.map(point => (
                         <li key={point.id}>
                              {/* //className={setSelectedPoints.includes(point.id) ? 'selected' : ''} */}
                              <img src={point.image} alt={point.name}/>
                              <h4>{point.name}</h4>
                              <span>Endereço: {point.endereco_completo}</span>
                              <span>Cidade: {point.city}/{point.uf}</span>
                              <span>Contato: {point.whatsapp}</span>
                     </li>
            ))}
                    </ul>
              </fieldset>

          </div>
          )
}

export default SearchPoint;