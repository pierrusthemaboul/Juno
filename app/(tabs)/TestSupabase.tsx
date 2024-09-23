import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClients';

export default function TestSupabase() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('profiles')  // Remplace 'profiles' par le nom de ta table
      .select('*');

    if (error) {
      console.error('Erreur de récupération des données:', error);
    } else {
      setData(data);
      console.log('Données récupérées:', data);
    }
  };

  return (
    <div>
      <h1>Données de Supabase :</h1>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.email || item.nom || JSON.stringify(item)}</li> // Modifier selon ta structure de table
        ))}
      </ul>
    </div>
  );
}
