import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClients';

export const useAdminStatus = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Vérifier si l'utilisateur est dans la table admin_users
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erreur lors de la vérification du statut admin:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!adminUser);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, loading };
};